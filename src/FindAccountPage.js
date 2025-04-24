import React from "react";
import "./FindAccountPage.css";

export function FindAccountPage() {
  return (
    <div className="findaccount-container">
      <div className="findaccount-box">
        <div className="findaccount-icon">
          <img src={`${process.env.PUBLIC_URL}/logo.jpeg`} alt="Logo" />
        </div>

        <div className="findaccount-description">
          비밀번호 분실 시 <br />
          <a
            href="tel:01055806521"
            style={{
              color: "#d5006d",
              fontWeight: "bold",
              textDecoration: "none",
            }}
          >
            010-5580-6521
          </a>{" "}
          로 문의 바랍니다.
        </div>
      </div>
    </div>
  );
}

export default FindAccountPage;
