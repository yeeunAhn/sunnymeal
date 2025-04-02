import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { getDocs, collection, query, where } from "firebase/firestore";
import { db } from "./firebase"; // Firebase 설정 파일
import "./LoginPage.css"; // 개별 CSS 파일

export function LoginPage() {
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState(""); // 비밀번호 상태 추가
  const navigate = useNavigate();

  // 전화번호 입력 시 자동으로 하이픈 추가
  const handlePhoneChange = (e) => {
    const rawPhone = e.target.value.replace(/\D/g, ""); // 숫자만 남기기
    let formattedPhone = rawPhone;

    if (rawPhone.length <= 3) {
      formattedPhone = rawPhone;
    } else if (rawPhone.length <= 6) {
      formattedPhone = rawPhone.replace(/(\d{3})(\d{0,4})/, "$1-$2");
    } else {
      formattedPhone = rawPhone.replace(/(\d{3})(\d{4})(\d{0,4})/, "$1-$2-$3");
    }

    setPhone(formattedPhone); // 포맷된 전화번호 상태에 저장
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value); // 비밀번호 상태 업데이트
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmedPhone = phone.replace(/-/g, "").trim(); // 하이픈 제거 후 전화번호 처리

    if (trimmedPhone === "0235") {
      navigate("/admin"); // 특정 번호는 관리자 페이지로 이동
    } else if (trimmedPhone.length === 10 || trimmedPhone.length === 11) {
      // Firestore에서 users 컬렉션 검색
      const usersRef = collection(db, "users");
      const q = query(
        usersRef,
        where("phone", "==", trimmedPhone),
        where("password", "==", password)
      );

      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        alert("전화번호나 비밀번호가 일치하지 않습니다.");
      } else {
        // 사용자 정보가 일치하는 경우 포인트 페이지로 이동
        navigate(`/points/${trimmedPhone}`);
      }
    } else {
      alert("올바른 전화번호를 입력하세요.");
    }
  };

  // 회원가입 버튼 클릭 시 실행될 함수
  const handleSignUp = () => {
    navigate("/signup"); // 회원가입 페이지로 이동
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <img
          src={`${process.env.PUBLIC_URL}/logo.jpeg`}
          alt="Company Logo"
          className="logo"
        />
        <h1 className="login-title">포인트 확인하기</h1>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="전화번호 입력"
            value={phone}
            onChange={handlePhoneChange} // 전화번호 입력 시 자동 포맷 적용
            className="login-input-1"
          />
          <input
            type="password" // 비밀번호 입력
            placeholder="비밀번호 입력"
            value={password}
            onChange={handlePasswordChange} // 비밀번호 입력
            className="login-input-2"
          />
          <button type="submit" className="adminpage-login-button">
            로그인
          </button>
          <button
            type="button"
            onClick={handleSignUp}
            className="adminpage-signup-button"
          >
            회원가입
          </button>
        </form>
      </div>
    </div>
  );
}
