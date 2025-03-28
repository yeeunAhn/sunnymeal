import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./LoginPage.css"; // 개별 CSS 파일

export function LoginPage() {
  const [phone, setPhone] = useState("");
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

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmedPhone = phone.replace(/-/g, "").trim(); // 하이픈 제거 후 전화번호 처리

    if (trimmedPhone.length === 10 || trimmedPhone.length === 11) {
      if (trimmedPhone === "01053426521") {
        navigate("/admin"); // 특정 번호는 관리자 페이지로 이동
      } else {
        navigate(`/points/${trimmedPhone}`); // 일반 사용자는 포인트 페이지로 이동
      }
    } else {
      alert("올바른 전화번호를 입력하세요.");
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        {/* 회사 로고 추가 */}
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
            className="login-input"
          />
          <button type="submit" className="login-button">
            로그인
          </button>
        </form>
      </div>
    </div>
  );
}
