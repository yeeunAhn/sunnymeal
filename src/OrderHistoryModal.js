import React, { useState } from "react";
import { db } from "./firebase";
import { doc, updateDoc, deleteDoc } from "firebase/firestore";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "./OrderHistoryModal.css";

function OrderHistoryModal({ phoneNumber, users, setUsers, onClose }) {
  const userOrders = users.filter((user) => user.number === phoneNumber);
  const [editingOrderId, setEditingOrderId] = useState(null);
  const [editFormData, setEditFormData] = useState({});

  // 수정 버튼 클릭 시 실행되는 함수
  const handleEditClick = (order) => {
    setEditingOrderId(order.id);
    setEditFormData({
      ...order,
      date: new Date(order.date), // 문자열을 Date 객체로 변환
    });
  };

  // 입력 값 변경 시 실행되는 함수
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditFormData({ ...editFormData, [name]: value });
  };

  // 날짜 변경 함수 (달력에서 선택 시 실행)
  const handleDateChange = (date) => {
    setEditFormData({ ...editFormData, date });
  };

  // Firestore에서 주문 업데이트
  const handleUpdateOrder = async () => {
    try {
      const orderRef = doc(db, "point", editingOrderId);
      await updateDoc(orderRef, {
        date: editFormData.date.toLocaleDateString("ko-KR"), // 날짜 포맷 변경
        company: editFormData.company,
        name: editFormData.name,
        payment: editFormData.payment,
      });

      // 화면에서도 즉시 반영
      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user.id === editingOrderId ? { ...user, ...editFormData } : user
        )
      );

      setEditingOrderId(null);
    } catch (error) {
      console.error("주문 수정 오류:", error);
    }
  };

  // Firestore에서 주문 삭제
  const handleDeleteOrder = async (orderId) => {
    try {
      await deleteDoc(doc(db, "point", orderId));

      // 화면에서도 삭제 반영
      setUsers((prevUsers) => prevUsers.filter((user) => user.id !== orderId));
    } catch (error) {
      console.error("주문 삭제 오류:", error);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>{phoneNumber}</h2>
        <button className="close-btn" onClick={onClose}>
          닫기
        </button>

        <table>
          <thead>
            <tr>
              <th>주문일</th>
              <th>상호명</th>
              <th>이름</th>
              <th>결제 금액</th>
              <th>관리</th>
            </tr>
          </thead>
          <tbody>
            {userOrders.map((order) => (
              <tr key={order.id}>
                {editingOrderId === order.id ? (
                  <>
                    <td>
                      <DatePicker
                        selected={editFormData.date}
                        onChange={handleDateChange}
                        dateFormat="yyyy.MM.dd"
                      />
                    </td>
                    <td>
                      <input
                        type="text"
                        name="company"
                        value={editFormData.company}
                        onChange={handleInputChange}
                      />
                    </td>
                    <td>
                      <input
                        type="text"
                        name="name"
                        value={editFormData.name}
                        onChange={handleInputChange}
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        name="payment"
                        value={editFormData.payment}
                        onChange={handleInputChange}
                      />
                    </td>
                    <td>
                      <button className="save-btn" onClick={handleUpdateOrder}>
                        저장
                      </button>
                      <button
                        className="cancel-btn"
                        onClick={() => setEditingOrderId(null)}
                      >
                        취소
                      </button>
                    </td>
                  </>
                ) : (
                  <>
                    <td>{new Date(order.date).toLocaleDateString("ko-KR")}</td>

                    <td>{order.company}</td>
                    <td>{order.name}</td>
                    <td>{Number(order.payment).toLocaleString()} 원</td>
                    <td>
                      <button
                        className="orderhistory-edit-btn"
                        onClick={() => handleEditClick(order)}
                      >
                        수정
                      </button>
                      <button
                        className="orderhistory-delete-btn"
                        onClick={() => handleDeleteOrder(order.id)}
                      >
                        삭제
                      </button>
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default OrderHistoryModal;
