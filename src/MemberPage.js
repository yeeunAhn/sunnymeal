import React, { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  deleteDoc,
  doc,
  updateDoc,
} from "firebase/firestore";
import { db } from "./firebase";
import "./MemberPage.css";

const MemberPage = () => {
  const [users, setUsers] = useState([]);
  const [editUserId, setEditUserId] = useState(null);
  const [newPassword, setNewPassword] = useState("");

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "users"));
      const usersData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setUsers(usersData);
    } catch (error) {
      console.error("회원 정보 불러오기 실패:", error);
    }
  };

  const handleDelete = async (id) => {
    const confirm = window.confirm("정말로 삭제하시겠습니까?");
    if (!confirm) return;

    try {
      await deleteDoc(doc(db, "users", id));
      fetchUsers(); // 삭제 후 목록 새로고침
    } catch (error) {
      console.error("회원 삭제 실패:", error);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const dd = String(date.getDate()).padStart(2, "0");
    return `${yyyy}.${mm}.${dd}`;
  };

  const handleEdit = (id, currentPassword) => {
    setEditUserId(id);
    setNewPassword(currentPassword);
  };

  const handleSave = async (id) => {
    if (newPassword.length !== 6) {
      alert("비밀번호는 6자리 숫자여야 합니다.");
      return;
    }

    try {
      await updateDoc(doc(db, "users", id), {
        password: newPassword,
      });
      setEditUserId(null);
      setNewPassword("");
      fetchUsers(); // 수정 후 목록 새로고침
    } catch (error) {
      console.error("회원 수정 실패:", error);
    }
  };

  return (
    <div className="member-container">
      <h2 className="member-title">회원 목록</h2>
      <table className="member-table">
        <thead>
          <tr>
            <th>전화번호</th>
            <th>비밀번호</th>
            <th>가입일</th>
            <th>관리</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id}>
              <td>{user.phone}</td>
              <td>
                {editUserId === user.id ? (
                  <input
                    type="text"
                    value={newPassword}
                    maxLength={6}
                    onChange={(e) =>
                      setNewPassword(e.target.value.replace(/\D/g, ""))
                    }
                  />
                ) : (
                  user.password
                )}
              </td>
              <td>{formatDate(user.signupDate)}</td>

              <td>
                {editUserId === user.id ? (
                  <>
                    <button onClick={() => handleSave(user.id)}>저장</button>
                    <button onClick={() => setEditUserId(null)}>취소</button>
                  </>
                ) : (
                  <>
                    <button onClick={() => handleEdit(user.id, user.password)}>
                      수정
                    </button>
                    <button onClick={() => handleDelete(user.id)}>삭제</button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default MemberPage;
