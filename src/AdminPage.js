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
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "./AdminPage.css";
import { useNavigate } from "react-router-dom";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

// 날짜 포맷 함수
const formatDate = (date) => {
  const tzOffset = date.getTimezoneOffset() * 60000;
  const localDate = new Date(date.getTime() - tzOffset);
  return localDate.toISOString().split("T")[0]; // yyyy-mm-dd 형식
};

function AdminPage() {
  const [users, setUsers] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({});
  const [isAddingOrder, setIsAddingOrder] = useState(false);
  const [isUsingPoints, setIsUsingPoints] = useState(false);
  const navigate = useNavigate();

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
  const [searchNumber, setSearchNumber] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "point"));
        const usersList = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        const sortedUsers = usersList.sort(
          (a, b) => new Date(b.date) - new Date(a.date)
        );

        setUsers(sortedUsers);
      } catch (error) {
        console.error("Error fetching users: ", error);
      }
    };

    fetchData();
  }, []);

  //모바일에서도 날짜 제대로 보이게
  const displayDate = (dateStr) => dateStr.replace(/-/g, ".");

  const toggleAddOrderForm = () => {
    setIsAddingOrder(!isAddingOrder);
    setIsUsingPoints(false);
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
        setUsers((prev) => {
          const updated = [...prev, { id: docRef.id, ...newOrder }];
          return updated.sort((a, b) => new Date(b.date) - new Date(a.date));
        });

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
      window.scrollTo({ top: 0, behavior: "smooth" });
    },
    [formData, setUsers]
  );

  //포인트 사용
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
      setUsers((prev) =>
        [...prev, { id: docRef.id, ...newPointUsage }].sort(
          (a, b) => new Date(b.date) - new Date(a.date)
        )
      );

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

  const handleEditClick = (user) => {
    setEditingId(user.id);
    setEditData({
      ...user,
      dateObj: new Date(user.date.replace(/\./g, "-")),
    });
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditData((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditDateChange = (date) => {
    setEditData((prev) => ({ ...prev, dateObj: date }));
  };

  const handleSaveEdit = async (id) => {
    try {
      const updated = {
        ...editData,
        date: formatDate(editData.dateObj),
        payment: Number(editData.payment),
      };
      delete updated.dateObj;

      await updateDoc(doc(db, "point", id), updated);

      setUsers((prev) =>
        prev.map((user) => (user.id === id ? { id, ...updated } : user))
      );
      setEditingId(null);
    } catch (error) {
      console.error("수정 중 오류 발생: ", error);
    }
  };

  const handleDelete = async (id) => {
    const confirm = window.confirm("정말로 삭제하시겠습니까?");
    if (!confirm) return;

    try {
      await deleteDoc(doc(db, "point", id));
      setUsers((prev) => prev.filter((user) => user.id !== id));
    } catch (error) {
      console.error("삭제 중 오류 발생: ", error);
    }
  };

  const formatPhoneNumber = (phone) => {
    const raw = phone?.replace(/\D/g, "");
    if (!raw) return "";
    if (raw.length <= 3) return raw;
    if (raw.length <= 7) return raw.replace(/(\d{3})(\d{1,4})/, "$1-$2");
    return raw.replace(/(\d{3})(\d{4})(\d{1,4})/, "$1-$2-$3");
  };

  const calculateTotalPoints = (number) => {
    return (
      users
        .filter((user) => user.number === number)
        .reduce((sum, u) => sum + (Number(u.payment) || 0), 0) * 0.02
    );
  };

  const handleDownloadExcel = () => {
    const dataForExcel = filteredUsers.map((user) => ({
      주문일: displayDate(user.date),
      상호명: user.company || "-",
      이름: user.name || "-",
      전화번호: formatPhoneNumber(user.number),
      결제금액: user.payment >= 0 ? user.payment : "-",
      사용포인트: user.payment < 0 ? -user.payment / 50 : "-",
      누적포인트: calculateTotalPoints(user.number),
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataForExcel);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "주문 내역");

    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });

    const blob = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    saveAs(blob, `주문내역_${formatDate(new Date())}.xlsx`);
  };

  const filteredUsers = searchNumber
    ? users.filter((u) =>
        u.number?.replace(/\D/g, "").includes(searchNumber.replace(/\D/g, ""))
      )
    : users;

  return (
    <div className="admin-container">
      <h1>주문 관리</h1>

      <div className="top-right-buttons">
        <button onClick={() => navigate("/members")}>회원관리</button>
        <button onClick={handleDownloadExcel}>엑셀 다운로드</button>
      </div>

      <div className="search-section">
        <label>전화번호 검색: </label>
        <input
          type="text"
          value={searchNumber}
          onChange={(e) => setSearchNumber(e.target.value)}
          placeholder="01012345678"
        />
      </div>

      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>주문일</th>
              <th>상호명</th>
              <th>이름</th>
              <th>번호</th>
              <th>결제 금액</th>
              <th>사용 포인트</th>
              <th>누적 포인트</th>
              <th>관리</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.length === 0 ? (
              <tr>
                <td colSpan="8">주문 내역이 없습니다.</td>
              </tr>
            ) : (
              filteredUsers.map((user) =>
                editingId === user.id ? (
                  <tr key={user.id}>
                    <td>
                      <DatePicker
                        selected={editData.dateObj}
                        onChange={handleEditDateChange}
                        dateFormat="yyyy.MM.dd"
                      />
                    </td>
                    <td>
                      <input
                        name="company"
                        value={editData.company || ""}
                        onChange={handleEditChange}
                        disabled={user.payment < 0} // 포인트 사용 내역이면 비활성화
                      />
                    </td>
                    <td>
                      <input
                        name="name"
                        value={editData.name || ""}
                        onChange={handleEditChange}
                        disabled={user.payment < 0}
                      />
                    </td>
                    <td>
                      <input
                        name="number"
                        value={editData.number || ""}
                        onChange={handleEditChange}
                      />
                    </td>
                    <td>
                      {/* 결제 금액 필드는 포인트 사용이 아닐 때만 보임 */}
                      {user.payment < 0 ? (
                        "-"
                      ) : (
                        <input
                          name="payment"
                          type="number"
                          value={editData.payment || 0}
                          onChange={handleEditChange}
                        />
                      )}
                    </td>
                    <td>
                      {/* 포인트 사용 내역일 경우에만 사용 포인트 필드 표시 */}
                      {user.payment < 0 ? (
                        <input
                          name="usedPoints"
                          type="number"
                          value={-editData.payment / 50}
                          onChange={(e) => {
                            const point = e.target.value;
                            setEditData((prev) => ({
                              ...prev,
                              payment: -point * 50,
                            }));
                          }}
                        />
                      ) : (
                        "-"
                      )}
                    </td>
                    <td>
                      {calculateTotalPoints(editData.number).toLocaleString()} P
                    </td>
                    <td>
                      <div style={{ display: "flex" }}>
                        <button
                          style={{ whiteSpace: "nowrap" }}
                          onClick={() => handleSaveEdit(user.id)}
                        >
                          저장
                        </button>
                        <button
                          style={{ whiteSpace: "nowrap" }}
                          onClick={() => setEditingId(null)}
                        >
                          취소
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  <tr key={user.id}>
                    <td>{displayDate(user.date)}</td>

                    <td>{user.company || "-"}</td>
                    <td>{user.name || "-"}</td>
                    <td>{formatPhoneNumber(user.number)}</td>
                    <td>
                      {user.payment < 0
                        ? "-"
                        : `${Number(user.payment).toLocaleString()} 원`}
                    </td>
                    <td>
                      {user.payment < 0
                        ? `${(-user.payment / 50).toLocaleString()} P`
                        : "-"}
                    </td>
                    <td>
                      {calculateTotalPoints(user.number).toLocaleString()} P
                    </td>
                    <td>
                      <button onClick={() => handleEditClick(user)}>
                        수정
                      </button>
                      <button onClick={() => handleDelete(user.id)}>
                        삭제
                      </button>
                    </td>
                  </tr>
                )
              )
            )}
          </tbody>
        </table>
      </div>

      {/* 주문 추가/포인트 사용 버튼 */}
      <div className="button-group">
        <button className="add-order-btn" onClick={toggleAddOrderForm}>
          {isAddingOrder ? "취소" : "주문 추가하기"}
        </button>
        <button className="use-points-btn" onClick={toggleUsePointsForm}>
          {isUsingPoints ? "취소" : "포인트 사용하기"}
        </button>
      </div>

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
              className="custom-input"
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
              className="custom-input"
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
              className="custom-input"
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
              className="custom-input"
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
              className="custom-input"
            />
          </div>
          <button className="submit-order-btn" type="submit">
            주문 추가
          </button>
        </form>
      )}

      {/* 포인트 사용 폼 */}
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
    </div>
  );
}

export default AdminPage;
