import React, { useEffect, useState } from "react";
import { db } from "./firebase"; // firebase.js에서 db import
import { collection, getDocs, setDoc, doc } from "firebase/firestore"; // Firestore에서 필요한 함수 임포트
import DatePicker from "react-datepicker"; // 날짜 선택 라이브러리 import
import "react-datepicker/dist/react-datepicker.css"; // 날짜 선택 CSS
import "./AdminPage.css"; // 개별 CSS 파일

function AdminPage() {
  const [users, setUsers] = useState([]); // 상태 변수로 Firestore에서 가져올 데이터를 저장
  const [formData, setFormData] = useState({
    date: new Date(), // 기본값은 현재 날짜
    company: "",
    name: "",
    number: "",
    payment: 0,
  }); // 폼 데이터 상태

  const [isAddingOrder, setIsAddingOrder] = useState(false); // 주문 추가 폼 보이기 여부

  useEffect(() => {
    // 데이터 가져오는 함수
    const fetchData = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "point")); // "point" 컬렉션에서 데이터 가져오기
        console.log("Firestore 데이터 가져오기 성공"); // 데이터 가져오기 성공 메시지
        const usersList = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        // date 필드를 기준으로 오름차순으로 정렬
        const sortedUsers = usersList.sort((a, b) => {
          const formatDate = (date) => {
            const [year, month, day] = date
              .split(".")
              .map((item) => item.trim());
            return new Date(
              `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`
            );
          };

          const dateA = formatDate(a.date); // 날짜 변환
          const dateB = formatDate(b.date); // 날짜 변환

          return dateA - dateB; // 오름차순 정렬 (최신 날짜가 하단)
        });

        console.log("Fetched and sorted users: ", sortedUsers); // 가져온 데이터 출력
        setUsers(sortedUsers); // 가져온 데이터 상태에 저장
      } catch (error) {
        console.error("Error fetching users: ", error); // 에러 출력
      }
    };

    fetchData(); // 페이지 로드 시 데이터 가져오기
  }, []);

  // 숫자에 쉼표 추가하는 함수
  const formatNumber = (num) => {
    if (isNaN(num)) return num; // 숫자가 아닌 값은 그대로 반환
    return Number(num).toLocaleString(); // 숫자로 변환 후 쉼표 추가
  };

  // 전화번호에 하이픈 추가하는 함수
  const formatPhoneNumber = (phone) => {
    const rawPhone = phone.replace(/\D/g, ""); // 숫자만 남기기
    let formattedPhone = rawPhone;

    if (rawPhone.length <= 3) {
      formattedPhone = rawPhone;
    } else if (rawPhone.length <= 6) {
      formattedPhone = rawPhone.replace(/(\d{3})(\d{0,4})/, "$1-$2");
    } else {
      formattedPhone = rawPhone.replace(/(\d{3})(\d{4})(\d{0,4})/, "$1-$2-$3");
    }

    return formattedPhone;
  };

  // 폼 데이터 입력 변경 함수
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // 날짜 선택 시 상태 업데이트
  const handleDateChange = (date) => {
    setFormData({ ...formData, date });
  };

  // "주문 추가하기" 버튼 클릭 시 폼 토글
  const toggleAddOrderForm = () => {
    setIsAddingOrder(!isAddingOrder);
  };

  const handleAddOrder = async (e) => {
    e.preventDefault();

    const { date, company, name, number, payment } = formData;

    // 해당 전화번호의 사용자 찾기
    const user = users.find((user) => user.number === number);
    const existingPoints = user ? user.point : 0;

    // 누적 포인트 계산: 기존 포인트 + 결제 금액의 2%
    const newPoints = existingPoints + payment * 0.02;

    try {
      // Firestore에 새로운 주문 추가
      const newOrder = {
        date: date.toLocaleDateString("ko-KR"), // "yyyy.mm.dd." 형식으로 저장
        company,
        name,
        number,
        payment,
        point: newPoints,
      };

      await setDoc(doc(db, "point", number), newOrder); // 전화번호를 document ID로 사용하여 추가

      console.log("새로운 주문이 추가되었습니다.");

      // ✅ 새 주문을 기존 리스트에 추가하여 UI 업데이트
      setUsers((prevUsers) => [...prevUsers, { id: number, ...newOrder }]);

      setIsAddingOrder(false); // 폼 숨기기
      setFormData({
        date: new Date(),
        company: "",
        name: "",
        number: "",
        payment: 0,
      }); // 폼 초기화
    } catch (error) {
      console.error("주문 추가 중 오류 발생: ", error);
    }
  };

  return (
    <div className="admin-container">
      <h1>관리자용 페이지</h1>

      {/* 주문 목록 */}
      <table>
        <thead>
          <tr>
            <th>주문일</th>
            <th>상호명</th>
            <th>이름</th>
            <th>번호</th>
            <th>결제 금액</th>
            <th>누적 포인트</th>
          </tr>
        </thead>
        <tbody>
          {users.length === 0 ? (
            <tr>
              <td colSpan="6">로딩 중...</td>
            </tr>
          ) : (
            users.map((user) => (
              <tr key={user.id}>
                <td>{user.date}</td>
                <td>{user.company}</td>
                <td>{user.name}</td>
                <td>{formatPhoneNumber(user.number)}</td>{" "}
                {/* 전화번호 하이픈 추가 */}
                <td>{formatNumber(user.payment)}</td> {/* 쉼표 추가 */}
                <td>{formatNumber(user.point)}</td> {/* 쉼표 추가 */}
              </tr>
            ))
          )}
        </tbody>
      </table>

      {/* 주문 추가 버튼 */}
      <button onClick={toggleAddOrderForm}>
        {isAddingOrder ? "취소" : "주문 추가하기"}
      </button>

      {/* 주문 추가 폼 */}
      {isAddingOrder && (
        <form onSubmit={handleAddOrder}>
          <div>
            <label>주문일: </label>
            <DatePicker
              selected={formData.date}
              onChange={handleDateChange}
              dateFormat="yyyy.MM.dd"
              required
            />
          </div>
          <div>
            <label>상호명: </label>
            <input
              type="text"
              name="company"
              value={formData.company}
              onChange={handleInputChange}
              required
            />
          </div>
          <div>
            <label>이름: </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
            />
          </div>
          <div>
            <label>전화번호: </label>
            <input
              type="text"
              name="number"
              value={formData.number}
              onChange={handleInputChange}
              required
            />
          </div>
          <div>
            <label>결제 금액: </label>
            <input
              type="number"
              name="payment"
              value={formData.payment}
              onChange={handleInputChange}
              required
            />
          </div>
          <button type="admin-submit">주문 추가</button>
        </form>
      )}
    </div>
  );
}

export default AdminPage;
