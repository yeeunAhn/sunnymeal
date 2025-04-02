import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { getFirestore, setDoc, doc } from "firebase/firestore"; // 필요한 함수들 추가
import { app } from "./firebase";
import "./SignupPage.css"; // 개별 CSS 파일

export function SignupPage() {
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState(""); // 비밀번호 확인 추가
  const navigate = useNavigate();

  const db = getFirestore(app); // Firestore 인스턴스를 가져옵니다.

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

  // 비밀번호 입력 처리
  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
  };

  // 비밀번호 확인 입력 처리
  const handleConfirmPasswordChange = (e) => {
    setConfirmPassword(e.target.value);
  };

  // 회원가입 버튼 클릭 시 실행
  const handleSignup = async (e) => {
    e.preventDefault();
    const trimmedPhone = phone.replace(/-/g, "").trim(); // 하이픈 제거 후 저장

    if (trimmedPhone.length !== 10 && trimmedPhone.length !== 11) {
      alert("올바른 전화번호를 입력하세요.");
      return;
    }

    if (password.length !== 6) {
      alert("비밀번호는 6자리여야 합니다.");
      return;
    }

    if (password !== confirmPassword) {
      alert("비밀번호가 일치하지 않습니다.");
      return;
    }

    try {
      // Firestore에 phone을 문서 ID로 설정
      const userRef = doc(db, "users", trimmedPhone); // 문서 ID를 전화번호로 설정
      await setDoc(userRef, {
        phone: trimmedPhone,
        password: password,
      });

      alert("회원가입이 완료되었습니다!");
      navigate("/"); // 로그인 페이지로 이동
    } catch (e) {
      console.error("회원가입 오류:", e);
      alert("회원가입에 실패했습니다.");
    }
  };

  return (
    <div className="signup-container">
      <div className="signup-box">
        {/* 회사 로고 추가 */}
        <img
          src={`${process.env.PUBLIC_URL}/logo.jpeg`}
          alt="Company Logo"
          className="logo"
        />
        <h1 className="signup-title">회원가입</h1>
        <form onSubmit={handleSignup}>
          <input
            type="text"
            placeholder="전화번호 입력"
            value={phone}
            onChange={handlePhoneChange}
            className="signup-input-1"
          />
          <input
            type="password"
            placeholder="비밀번호 (6자리)"
            value={password}
            onChange={handlePasswordChange}
            className="signup-input-2"
            maxLength="6"
          />
          <input
            type="password"
            placeholder="비밀번호 확인 (6자리)"
            value={confirmPassword}
            onChange={handleConfirmPasswordChange}
            className="signup-input-3"
            maxLength="6"
          />
          <button type="submit" className="signup-button">
            가입하기
          </button>
        </form>
      </div>
    </div>
  );
}
