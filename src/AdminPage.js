import React, { useEffect, useState, useCallback } from "react";
import { db } from "./firebase";
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";
import OrderHistoryModal from "./OrderHistoryModal"; // 모달 컴포넌트 추가
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "./AdminPage.css";

function AdminPage() {
  const [users, setUsers] = useState([]);
  const [selectedPhone, setSelectedPhone] = useState(null); //  전화번호
  const [isAddingOrder, setIsAddingOrder] = useState(false); // 주문 추가
  const [isUsingPoints, setIsUsingPoints] = useState(false); // 포인트 사용
  const [formData, setFormData] = useState({
    date: new Date(),
    company: "",
    name: "",
    number: "",
    payment: 0,
  });
  const [pointData, setPointData] = useState({
    date: new Date(),
    number: "",
    usedPoints: 0,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "point"));
        const usersList = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        const sortedUsers = usersList.sort(
          (a, b) => new Date(a.date) - new Date(b.date)
        );
        setUsers(sortedUsers);
      } catch (error) {
        console.error("Error fetching users: ", error);
      }
    };

    fetchData();
  }, []);

  // 누적 포인트 계산 함수
  const calculateTotalPoints = (phoneNumber) => {
    return (
      users
        .filter((user) => user.number === phoneNumber) // 같은 전화번호 필터링
        .reduce((sum, user) => sum + (Number(user.payment) || 0), 0) * 0.02
    ); // 전체 합산 후 2% 적용
  };

  // 최신 주문일 계산 함수
  const calculateLatestOrderDate = (phoneNumber) => {
    // 결제 금액(payment)이 양수인 데이터만 필터링 (포인트 사용 기록 제외)
    const orders = users.filter(
      (user) => user.number === phoneNumber && Number(user.payment) > 0
    );

    if (orders.length === 0) return "주문 기록 없음";

    // 최신 주문일 찾기
    return orders.reduce((latest, order) =>
      new Date(order.date) > new Date(latest.date) ? order : latest
    ).date;
  };

  const formatPhoneNumber = (phone) => {
    const rawPhone = phone.replace(/\D/g, ""); // 숫자만 추출
    if (rawPhone.length <= 3) return rawPhone;
    if (rawPhone.length <= 7)
      return rawPhone.replace(/(\d{3})(\d{1,4})/, "$1-$2");
    return rawPhone.replace(/(\d{3})(\d{4})(\d{1,4})/, "$1-$2-$3");
  };

  const toggleAddOrderForm = () => {
    setIsAddingOrder(!isAddingOrder);
  };

  const toggleUsePointsForm = () => {
    setIsUsingPoints(!isUsingPoints);
    setIsAddingOrder(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handlePointInputChange = (e) => {
    const { name, value } = e.target;
    setPointData({ ...pointData, [name]: value });
  };

  const handleDateChange = (date) => {
    setFormData({ ...formData, date });
  };

  const handlePointDateChange = (date) => {
    setPointData({ ...pointData, date });
  };

  const handleAddOrder = useCallback(
    async (e) => {
      e.preventDefault();

      const { date, company, name, number, payment } = formData;

      try {
        const newOrder = {
          date: date.toLocaleDateString("ko-KR"),
          company,
          name,
          number,
          payment,
        };

        const docRef = await addDoc(collection(db, "point"), newOrder);
        setUsers((prevUsers) => [...prevUsers, { id: docRef.id, ...newOrder }]);

        setIsAddingOrder(false);
        setFormData({
          date: new Date(),
          company: "",
          name: "",
          number: "",
          payment: 0,
        });
      } catch (error) {
        console.error("주문 추가 중 오류 발생: ", error);
      }
    },
    [formData, setUsers]
  );

  const handleUsePoints = async (e) => {
    e.preventDefault();
    const { date, number, usedPoints } = pointData;
    const totalPoints = calculateTotalPoints(number);

    if (usedPoints > totalPoints) {
      alert("사용하려는 포인트가 보유한 포인트보다 많습니다.");
      return;
    }

    try {
      const newPointUsage = {
        date: date.toLocaleDateString("ko-KR"),
        number,
        payment: -usedPoints * 50, // 포인트 차감, 1P = 50원
      };

      const docRef = await addDoc(collection(db, "point"), newPointUsage);
      setUsers((prevUsers) => [
        ...prevUsers,
        { id: docRef.id, ...newPointUsage },
      ]);

      setIsUsingPoints(false);
      setPointData({
        date: new Date(),
        number: "",
        usedPoints: 0,
      });

      alert("포인트가 정상적으로 사용되었습니다.");
    } catch (error) {
      console.error("포인트 사용 중 오류 발생: ", error);
    }
  };

  return (
    <div className="admin-container">
      <h1>관리자 페이지</h1>

      <table>
        <thead>
          <tr>
            <th>최근 주문일</th>
            <th>상호명</th>
            <th>이름</th>
            <th>번호</th>
            <th>결제 금액</th>
            <th>누적포인트</th>
            <th>관리</th>
          </tr>
        </thead>
        <tbody>
          {users.length === 0 ? (
            <tr>
              <td colSpan="7">로딩 중...</td>
            </tr>
          ) : (
            [...new Set(users.map((user) => user.number))].map((phone) => {
              const firstUser = users.find((user) => user.number === phone);
              return (
                <tr key={firstUser.id}>
                  <td>{calculateLatestOrderDate(firstUser.number)}</td>{" "}
                  {/* 최신 주문일 표시 */}
                  <td>{firstUser.company}</td>
                  <td>{firstUser.name}</td>
                  <td>{formatPhoneNumber(firstUser.number)}</td>
                  <td>{Number(firstUser.payment).toLocaleString()} 원</td>
                  <td>
                    {calculateTotalPoints(firstUser.number).toLocaleString()} P
                  </td>
                  <td>
                    <button onClick={() => setSelectedPhone(firstUser.number)}>
                      전체 주문보기
                    </button>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>

      <div className="button-group">
        <button className="add-order-btn" onClick={toggleAddOrderForm}>
          {isAddingOrder ? "취소" : "주문 추가하기"}
        </button>
        <button className="use-points-btn" onClick={toggleUsePointsForm}>
          {isUsingPoints ? "취소" : "포인트 사용하기"}
        </button>
      </div>

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
          <button className="submit-order-btn" type="submit">
            주문 추가
          </button>
        </form>
      )}

      {isUsingPoints && (
        <form onSubmit={handleUsePoints}>
          <div>
            <label>사용일: </label>
            <DatePicker
              selected={pointData.date}
              onChange={handlePointDateChange}
              dateFormat="yyyy.MM.dd"
              required
            />
          </div>
          <div>
            <label>전화번호: </label>
            <input
              type="text"
              name="number"
              value={pointData.number}
              onChange={handlePointInputChange}
              required
            />
          </div>
          <div>
            <label>사용 포인트: </label>
            <input
              type="number"
              name="usedPoints"
              value={pointData.usedPoints}
              onChange={handlePointInputChange}
              required
            />
          </div>
          <button type="submit">포인트 사용</button>
        </form>
      )}

      {/* 전체 주문 모달 창 */}
      {selectedPhone && (
        <OrderHistoryModal
          phoneNumber={selectedPhone}
          users={users}
          setUsers={setUsers}
          onClose={() => setSelectedPhone(null)}
        />
      )}
    </div>
  );
}

export default AdminPage;
