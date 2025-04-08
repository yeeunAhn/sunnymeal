import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { getDocs, collection, query, where } from "firebase/firestore";
import { db } from "./firebase"; // Firebase 설정 파일
import "./LoginPage.css"; // 개별 CSS 파일

export function LoginPage() {
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState(""); // 비밀번호 상태 추가
  const navigate = useNavigate();

  // 주석처리없는버전
  const handlePhoneChange = (e) => {
    const rawPhone = e.target.value.replace(/\D/g, ""); // 숫자만 남기기
    if (rawPhone.length <= 11) {
      setPhone(rawPhone);
    }
  };

  // 전화번호 입력 시 자동으로 하이픈 추가
  // const handlePhoneChange = (e) => {
  //   const rawPhone = e.target.value.replace(/\D/g, ""); // 숫자만 남기기
  //   let formattedPhone = "";

  //   if (rawPhone.length <= 3) {
  //     formattedPhone = rawPhone;
  //   } else if (rawPhone.length <= 6) {
  //     formattedPhone = `${rawPhone.slice(0, 3)}-${rawPhone.slice(3)}`;
  //   } else if (rawPhone.length <= 10) {
  //     formattedPhone = `${rawPhone.slice(0, 3)}-${rawPhone.slice(
  //       3,
  //       7
  //     )}-${rawPhone.slice(7)}`;
  //   } else {
  //     formattedPhone = `${rawPhone.slice(0, 3)}-${rawPhone.slice(
  //       3,
  //       7
  //     )}-${rawPhone.slice(7, 11)}`;
  //   }

  //   // 기존 입력 값보다 길이가 짧아지는 경우(즉, 백스페이스 사용 시)는 그냥 rawPhone을 그대로 사용
  //   if (e.target.value.length < phone.length) {
  //     setPhone(e.target.value);
  //   } else {
  //     setPhone(formattedPhone);
  //   }
  // };

  const handlePasswordChange = (e) => {
    const onlyNumbers = e.target.value.replace(/\D/g, ""); // 숫자만 허용
    setPassword(onlyNumbers);
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
  // 아이디비번찾기
  const handleFindAccount = () => {
    navigate("/findaccount"); // 경로는 원하는 대로 설정
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <div className="login-icon">
          <img src={`${process.env.PUBLIC_URL}/logo.jpeg`} alt="Logo" />
          <h1 className="login-subtitle">포인트 확인하기</h1>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="login-input-group">
            <input
              type="tel"
              placeholder="phone"
              value={phone}
              onChange={handlePhoneChange}
            />
          </div>
          <div className="login-input-group">
            <input
              type="password"
              inputMode="numeric"
              pattern="[0-9]*"
              placeholder="password"
              value={password}
              onChange={handlePasswordChange}
              maxLength={6}
            />
          </div>

          <button type="submit" className="login-btn">
            로그인
          </button>

          <div className="login-options">
            <span className="forgot-password" onClick={handleFindAccount}>
              비밀번호 찾기
            </span>
          </div>

          <span className="signup-link">계정이 없으신가요?</span>
          <button type="button" className="signup-btn" onClick={handleSignUp}>
            회원가입
          </button>
        </form>
      </div>
    </div>
  );
}
