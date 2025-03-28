import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { db } from "./firebase"; // firebase.js에서 db import
import { doc, getDoc } from "firebase/firestore"; // Firestore에서 필요한 함수 임포트
import "./PointsPage.css"; // 개별 CSS 파일

export function PointsPage() {
  const { phone } = useParams(); // URL에서 phone 파라미터 추출
  const [points, setPoints] = useState(null);

  // 전화번호에 하이픈 추가하는 함수
  const formatPhoneNumber = (phone) => {
    const rawPhone = phone.replace(/\D/g, ""); // 숫자만 남기기
    let formattedPhone = rawPhone;

    if (rawPhone.length <= 3) {
      formattedPhone = rawPhone;
    } else if (rawPhone.length <= 6) {
      formattedPhone = rawPhone.replace(/(\d{3})(\d{0,4})/, "$1-$2");
    } else {
      formattedPhone = rawPhone.replace(/(\d{3})(\d{4})(\d{0,4})/, "$1-$2-$3");
    }

    return formattedPhone;
  };

  useEffect(() => {
    // Firestore에서 해당 전화번호에 맞는 포인트 정보 가져오기
    const fetchPoints = async () => {
      try {
        const docRef = doc(db, "point", phone); // "point" 컬렉션에서 phone을 document ID로 사용
        const docSnap = await getDoc(docRef); // 해당 document 읽기

        if (docSnap.exists()) {
          // document가 존재하면 포인트 정보 가져오기
          setPoints(docSnap.data().point); // point 필드에 저장된 값
        } else {
          setPoints(0); // 데이터가 없다면 포인트 0으로 설정
        }
      } catch (error) {
        console.error("Error getting document: ", error);
        setPoints(0); // 오류가 발생하면 포인트 0으로 설정
      }
    };

    fetchPoints(); // 페이지 로드 시 포인트 정보 가져오기
  }, [phone]); // phone 값이 바뀔 때마다 다시 실행

  return (
    <div className="points-container">
      <div className="points-box">
        <h1 className="points-title">포인트 확인</h1>
        <p className="points-info">전화번호: {formatPhoneNumber(phone)}</p>{" "}
        {/* 전화번호에 하이픈 추가 */}
        <p className="points-value">
          보유 포인트: {points !== null ? `${points}P` : "로딩 중..."}
        </p>
      </div>
    </div>
  );
}
