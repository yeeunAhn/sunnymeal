import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { db } from "./firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import "./PointsPage.css";

export function PointsPage() {
  const { phone } = useParams(); // URL에서 phone 파라미터 추출
  const [remainingPoints, setRemainingPoints] = useState(null);
  const [orderHistory, setOrderHistory] = useState([]);

  const formatPhoneNumber = (phone) => {
    const rawPhone = phone.replace(/\D/g, "");
    if (rawPhone.length <= 3) return rawPhone;
    if (rawPhone.length <= 6)
      return rawPhone.replace(/(\d{3})(\d{0,4})/, "$1-$2");
    return rawPhone.replace(/(\d{3})(\d{4})(\d{0,4})/, "$1-$2-$3");
  };

  function parseDate(dateStr) {
    // "2025.04.06" → [2025, 04, 06]
    const [year, month, day] = dateStr.split(".");
    return new Date(Number(year), Number(month) - 1, Number(day));
  }

  useEffect(() => {
    const fetchRemainingPoints = async () => {
      try {
        const q = query(collection(db, "point"), where("number", "==", phone));
        const querySnapshot = await getDocs(q);

        let totalEarnedPoints = 0;
        let totalUsedPoints = 0;
        const history = [];

        querySnapshot.forEach((doc) => {
          const data = doc.data();
          history.push({
            date: data.date,
            payment: data.payment,
            usedPoints: data.usedPoints,
          });

          if (data.payment > 0) {
            totalEarnedPoints += Number(data.payment) * 0.02;
          } else if (data.payment < 0) {
            totalUsedPoints += Math.abs(Number(data.payment)) * 0.02;
          }

          if (data.usedPoints) {
            totalUsedPoints += Number(data.usedPoints);
          }
        });

        // ✅ 날짜 문자열 안전하게 파싱해서 정렬
        history.sort((a, b) => parseDate(a.date) - parseDate(b.date));

        setRemainingPoints(totalEarnedPoints - totalUsedPoints);
        setOrderHistory(history);
        setRemainingPoints(totalEarnedPoints - totalUsedPoints);
        setOrderHistory(history);
      } catch (error) {
        console.error("포인트 불러오기 오류: ", error);
        setRemainingPoints(0);
      }
    };

    fetchRemainingPoints();
  }, [phone]);

  return (
    <div className="points-container">
      <div className="points-box">
        <div className="points-icon">
          <img src={`${process.env.PUBLIC_URL}/logo.jpeg`} alt="Logo" />
          <h1 className="points-title">
            {formatPhoneNumber(phone)}님, 안녕하세요!
          </h1>
        </div>

        {/* 보유 포인트 */}
        <div className="points-balance">
          <p className="points-label">보유 포인트</p>
          <p className="points-value">
            {remainingPoints !== null
              ? `${remainingPoints.toLocaleString()}P`
              : "로딩 중..."}
          </p>
        </div>

        {/* 적립/사용 내역 */}
        <h2 className="points-history-title">적립/사용내역</h2>
        <div className="points-history">
          {orderHistory.map((order, index) => (
            <div key={index} className="history-item">
              <div className="history-info">
                <p className="history-description">
                  {order.payment > 0 ? "결제 적립" : "포인트 사용"}
                </p>
                <p className="history-date">{order.date}</p>
              </div>
              <p
                className={`history-points ${
                  order.payment > 0 ? "positive" : "negative"
                }`}
              >
                {order.payment > 0
                  ? `+${(order.payment * 0.02).toLocaleString()}P`
                  : `-${(Math.abs(order.payment) * 0.02).toLocaleString()}P`}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
