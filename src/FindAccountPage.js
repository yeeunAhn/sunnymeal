import React from "react";
import "./FindAccountPage.css";

function FindAccountPage() {
  return (
    <div className="findaccount-container">
      <div className="findaccount-box">
        <div className="findaccount-icon">
          <img src={`${process.env.PUBLIC_URL}/logo.jpeg`} alt="Logo" />
          <h1 className="findaccount-title">비밀번호 찾기</h1>
        </div>

        <div className="findaccount-description">
          가입 시 입력한 전화번호로 비밀번호를 찾을 수 있습니다.
        </div>

        <input
          type="text"
          placeholder="전화번호 입력"
          className="findaccount-input"
        />

        <button className="findaccount-btn">찾기</button>
      </div>
    </div>
  );
}

export default FindAccountPage;
