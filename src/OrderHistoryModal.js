import React, { useState } from "react";
import { db } from "./firebase";
import { doc, updateDoc, deleteDoc } from "firebase/firestore";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "./OrderHistoryModal.css";

function OrderHistoryModal({ phoneNumber, users, setUsers, onClose }) {
  const parseKoreanDate = (dateString) => {
    if (typeof dateString === "string") {
      // "2025. 4. 3." 또는 "2025.04.03." 형태
      const parts = dateString
        .trim()
        .replace(/\.$/, "") // 마지막 점 제거
        .split(".");

      if (parts.length === 3) {
        const year = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10) - 1; // JS 월은 0부터 시작
        const day = parseInt(parts[2], 10);
        return new Date(year, month, day);
      }
    } else if (dateString instanceof Date) {
      return dateString;
    }

    return new Date(); // fallback
  };
  const userOrders = users
    .filter((user) => user.number === phoneNumber)
    .sort((a, b) => {
      const dateA = parseKoreanDate(a.date);
      const dateB = parseKoreanDate(b.date);
      return dateA - dateB; // 오래된 날짜 순
    });

  const [editingOrderId, setEditingOrderId] = useState(null);
  const [editFormData, setEditFormData] = useState({});

  // 수정 버튼 클릭 시 실행되는 함수
  const handleEditClick = (order) => {
    const parseToDate = (date) => {
      if (typeof date === "string") {
        // 예: "2025. 4. 3." → "2025-04-03"
        const cleaned = date
          .replace(/\./g, "-")
          .replace(/\s/g, "")
          .slice(0, -1); // 맨 끝 점 제거
        return new Date(cleaned);
      }
      return date instanceof Date ? date : new Date(); // fallback
    };

    setEditingOrderId(order.id);
    setEditFormData({
      ...order,
      date: parseKoreanDate(order.date), // 고친 함수 사용
      usedPoints: order.payment
        ? Math.floor(Math.abs(order.payment) * 0.02)
        : 0,
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
  // YYYY.MM.DD 형식으로 날짜 포맷 함수
  const formatDateToKoreanStyle = (date) => {
    const year = date.getFullYear();
    const month = `${date.getMonth() + 1}`.padStart(2, "0");
    const day = `${date.getDate()}`.padStart(2, "0");
    return `${year}.${month}.${day}`;
  };

  // Firestore에서 주문 업데이트
  const handleUpdateOrder = async () => {
    try {
      const orderRef = doc(db, "point", editingOrderId);
      await updateDoc(orderRef, {
        date: formatDateToKoreanStyle(editFormData.date),
        company: editFormData.company,
        name: editFormData.name,
        payment: Number(editFormData.payment),
        usedPoints: Math.abs(Number(editFormData.usedPoints)), // 항상 양수로 저장
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
  // 주문삭제
  const handleDeleteOrder = async (orderId) => {
    const confirmDelete = window.confirm("정말 삭제하시겠습니까?");
    if (!confirmDelete) return; // 사용자가 취소하면 함수 종료

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
              <th>포인트</th> {/* ✅ 새로 추가 */}
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
                      {order.payment > 0 ? (
                        <input
                          type="number"
                          name="payment"
                          value={editFormData.payment}
                          onChange={handleInputChange}
                        />
                      ) : (
                        "-"
                      )}
                    </td>{" "}
                    {/* ✅ 결제 금액이 양수일 때만 수정 가능, 음수면 "-" */}
                    <td>
                      {order.payment < 0 ? (
                        <input
                          type="number"
                          name="usedPoints"
                          value={editFormData.usedPoints}
                          onChange={handleInputChange}
                        />
                      ) : (
                        "-"
                      )}
                    </td>{" "}
                    {/* ✅ 결제 금액이 음수일 때만 수정 가능, 양수면 "-" */}
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
                    <td>
                      {parseKoreanDate(order.date).toLocaleDateString("ko-KR")}
                    </td>
                    <td>{order.company}</td>
                    <td>{order.name}</td>
                    <td>
                      {order.payment > 0
                        ? `${Number(order.payment).toLocaleString()} 원`
                        : "-"}
                    </td>{" "}
                    {/* ✅ 결제 금액이 양수면 정상 표시, 음수면 "-" */}
                    <td>
                      {order.payment < 0
                        ? `-${Math.abs(
                            order.usedPoints ||
                              Math.floor(Math.abs(order.payment) * 0.02)
                          ).toLocaleString()}P`
                        : `+${Math.floor(
                            order.payment * 0.02
                          ).toLocaleString()}P`}
                    </td>
                    {/* ✅ 결제 금액이 양수면 +포인트, 음수면 -포인트 */}
                    {/* ✅ 결제 금액이 음수면 "-차감포인트" 표시, 양수면 "-" */}
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
