import React, { useEffect, useState, useCallback } from "react";
import { db } from "./firebase";
import { collection, getDocs, addDoc } from "firebase/firestore";
import OrderHistoryModal from "./OrderHistoryModal";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "./AdminPage.css";

// 날짜 포맷 함수
const formatDate = (date) => {
  const tzOffset = date.getTimezoneOffset() * 60000; // ms
  const localDate = new Date(date.getTime() - tzOffset);
  return localDate.toISOString().split("T")[0].replace(/-/g, ".");
};

function AdminPage() {
  const [users, setUsers] = useState([]);
  const [selectedPhone, setSelectedPhone] = useState(null);
  const [isAddingOrder, setIsAddingOrder] = useState(false);
  const [isUsingPoints, setIsUsingPoints] = useState(false);
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

        const sortedUsers = usersList.sort((a, b) => {
          return new Date(a.date) - new Date(b.date);
        });

        setUsers(sortedUsers);
      } catch (error) {
        console.error("Error fetching users: ", error);
      }
    };

    fetchData();
  }, []);

  const calculateTotalPoints = (phoneNumber) => {
    return (
      users
        .filter((user) => user.number === phoneNumber)
        .reduce((sum, user) => sum + (Number(user.payment) || 0), 0) * 0.02
    );
  };

  const formatPhoneNumber = (phone) => {
    const rawPhone = phone.replace(/\D/g, "");
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
          date: formatDate(date),
          company,
          name,
          number,
          payment: Number(payment),
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
        date: formatDate(date),
        number,
        payment: -usedPoints * 50,
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
      <h1>주문 관리</h1>
      <div className="table-wrapper">
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
                const userOrders = users.filter(
                  (user) => user.number === phone
                );
                const latestOrder = userOrders.reduce((latest, current) =>
                  new Date(current.date) > new Date(latest.date)
                    ? current
                    : latest
                );
                const isPointUsage = Number(latestOrder.payment) < 0;

                return (
                  <tr key={latestOrder.id}>
                    <td>{latestOrder.date}</td>
                    <td>{latestOrder.company || "-"}</td>
                    <td>{latestOrder.name || "-"}</td>
                    <td>{formatPhoneNumber(latestOrder.number)}</td>
                    <td>
                      {isPointUsage
                        ? "-"
                        : Number(latestOrder.payment).toLocaleString() + " 원"}
                    </td>
                    <td>
                      {calculateTotalPoints(
                        latestOrder.number
                      ).toLocaleString()}{" "}
                      P
                    </td>
                    <td>
                      <button
                        onClick={() => setSelectedPhone(latestOrder.number)}
                      >
                        더보기
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

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
          <button type="submit" className="use-points-btn-2">
            포인트 사용
          </button>
        </form>
      )}

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
