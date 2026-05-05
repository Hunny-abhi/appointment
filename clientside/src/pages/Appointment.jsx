import React, { useContext, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AppContext } from "../context/AppContext";
import { assets } from "../assets/assets";
import RelatedDoctors from "../components/RelatedDoctors";
import { toast } from "react-toastify";
import axios from "axios";

const Appointment = () => {
  const { docId } = useParams();
  const { doctors, currencySymbol, backendUrl, token, getDoctorsData } =
    useContext(AppContext);

  const navigate = useNavigate();

  const daysOfWeek = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

  const [docInfo, setDocInfo] = useState(null);
  const [docSlots, setDocSlots] = useState([]);
  const [slotIndex, setSlotIndex] = useState(0);
  const [slotTime, setSlotTime] = useState("");

 
  useEffect(() => {
    const doctor = doctors.find((doc) => doc._id === docId);
    setDocInfo(doctor || null);
  }, [doctors, docId]);

 
  useEffect(() => {
    if (!docInfo) return;

    const getSlots = () => {
      let today = new Date();
      let allSlots = [];

      for (let i = 0; i < 7; i++) {
        let currentDate = new Date(today);
        currentDate.setDate(today.getDate() + i);

        let endTime = new Date(today);
        endTime.setDate(today.getDate() + i);
        endTime.setHours(21, 0, 0, 0);

        if (today.getDate() === currentDate.getDate()) {
          currentDate.setHours(
            currentDate.getHours() > 10 ? currentDate.getHours() + 1 : 10,
          );
          currentDate.setMinutes(currentDate.getMinutes() > 30 ? 30 : 0);
        } else {
          currentDate.setHours(10);
          currentDate.setMinutes(0);
        }

        let timeSlots = [];

        while (currentDate < endTime) {
          let formattedTime = currentDate.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          });

          let day = currentDate.getDate();
          let month = currentDate.getMonth() + 1;
          let year = currentDate.getFullYear();

          const slotDate = `${day}_${month}_${year}`;

          const isBooked =
            docInfo?.slots_booked?.[slotDate]?.includes(formattedTime);

          if (!isBooked) {
            timeSlots.push({
              datetime: new Date(currentDate),
              time: formattedTime,
            });
          }

          currentDate.setMinutes(currentDate.getMinutes() + 30);
        }

        allSlots.push(timeSlots);
      }

      setDocSlots(allSlots);
    };

    getSlots();
  }, [docInfo]);

  const bookAppointment = async () => {
    if (!token) {
      toast.warn("Login first");
      return navigate("/login");
    }

    if (!docSlots.length || !docSlots[slotIndex]?.length || !slotTime) {
      return toast.error("Select slot");
    }

    try {
      const date = docSlots[slotIndex][0].datetime;

      const slotDate = `${date.getDate()}_${date.getMonth() + 1}_${date.getFullYear()}`;

      const { data } = await axios.post(
        backendUrl + "/api/user/book-appointment",
        { docId, slotDate, slotTime },
        { headers: { token } },
      );

      if (data.success) {
        toast.success(data.message);
        getDoctorsData();
        navigate("/my-appointments");
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  if (!docInfo) return <p>Loading...</p>;

  return (
    <div>
      
      <div className="flex flex-col gap-4 sm:flex-row">
        <img
          className="w-full rounded-lg sm:max-w-72 bg-primary"
          src={docInfo.image}
          alt=""
        />

        <div className="flex-1 p-6 bg-white border rounded-lg">
          <p className="text-2xl font-medium">
            {docInfo.name}
            <img className="inline w-5 ml-2" src={assets.verified_icon} />
          </p>

          <p className="mt-1 text-sm text-gray-600">
            {docInfo.degree} - {docInfo.speciality}
          </p>

          <p className="mt-2 text-gray-500">{docInfo.about}</p>

          <p className="mt-3">
            Fee: {currencySymbol}
            {docInfo.fees}
          </p>
        </div>
      </div>

      <div className="mt-6">
        <p className="font-medium">Booking slots</p>

        <div className="flex gap-3 mt-3 overflow-x-scroll">
          {docSlots.map((item, index) => (
            <div
              key={index}
              onClick={() => setSlotIndex(index)}
              className={`p-3 rounded-full cursor-pointer ${
                slotIndex === index ? "bg-primary text-white" : "border"
              }`}
            >
              <p>{item[0] && daysOfWeek[item[0].datetime.getDay()]}</p>
              <p>{item[0] && item[0].datetime.getDate()}</p>
            </div>
          ))}
        </div>

        <div className="flex gap-2 mt-4 overflow-x-scroll">
          {docSlots[slotIndex]?.map((item, i) => (
            <p
              key={i}
              onClick={() => setSlotTime(item.time)}
              className={`px-4 py-2 rounded-full cursor-pointer ${
                item.time === slotTime ? "bg-primary text-white" : "border"
              }`}
            >
              {item.time}
            </p>
          ))}
        </div>

        <button
          onClick={bookAppointment}
          className="px-6 py-2 mt-5 text-white rounded-full bg-primary"
        >
          Book Appointment
        </button>
      </div>

      <RelatedDoctors docId={docId} speciality={docInfo.speciality} />
    </div>
  );
};

export default Appointment;
