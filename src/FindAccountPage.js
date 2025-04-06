import React, { useState } from "react";
import "./FindAccountPage.css";
import { db } from "./firebase";
import { collection, query, where, getDocs } from "firebase/firestore";

function FindAccountPage() {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [foundPassword, setFoundPassword] = useState(null);
  const [error, setError] = useState("");

  const handleSearch = async () => {
    setError("");
    setFoundPassword(null);
    try {
      const q = query(
        collection(db, "users"),
        where("phone", "==", phoneNumber)
      );
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const userDoc = querySnapshot.docs[0];
        const userData = userDoc.data();
        setFoundPassword(userData.password);
      } else {
        setError("해당 전화번호로 가입된 계정이 없습니다.");
      }
    } catch (err) {
      console.error("비밀번호 찾기 오류: ", err);
      setError("오류가 발생했습니다. 다시 시도해주세요.");
    }
  };

  const formatPhoneNumber = (value) => {
    const numbers = value.replace(/\D/g, ""); // 숫자 이외 제거
    let result = "";

    if (numbers.length < 4) {
      result = numbers;
    } else if (numbers.length < 8) {
      result = `${numbers.slice(0, 3)}-${numbers.slice(3)}`;
    } else {
      result = `${numbers.slice(0, 3)}-${numbers.slice(3, 7)}-${numbers.slice(
        7,
        11
      )}`;
    }

    return result;
  };

  return (
    <div className="findaccount-container">
      <div className="findaccount-box">
        <div className="findaccount-icon">
          <img src={`${process.env.PUBLIC_URL}/logo.jpeg`} alt="Logo" />
          <h1 className="findaccount-title">비밀번호 찾기</h1>
        </div>

        <div className="findaccount-description">
          가입 시 입력한 전화번호를 입력하세요.
        </div>

        <input
          type="text"
          placeholder="전화번호 입력"
          className="findaccount-input"
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(formatPhoneNumber(e.target.value))}
        />

        <button className="findaccount-btn" onClick={handleSearch}>
          찾기
        </button>

        {/* 결과 표시 */}
        {foundPassword && (
          <div className="findaccount-result">
            <strong>{foundPassword}</strong>
          </div>
        )}
        {error && <div className="findaccount-error">{error}</div>}
      </div>
    </div>
  );
}

export default FindAccountPage;
