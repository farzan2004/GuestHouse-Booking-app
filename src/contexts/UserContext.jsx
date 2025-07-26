import { createContext, useContext, useState } from "react";

const UserContext = createContext();

// export const UserProvider = ({ children }) => {
//     const [userData, setUserData] = useState({
//         firstName: "John",
//         lastName: "Doe",
//         dob: "1995-06-15",
//         address: "123 Street",
//         city: "New York",
//         state: "NY",
//         pinCode: "10001",
//         email: "testuser@example.com",
//         mobile: "9876543210",
//         bookings: [
//             { _id: "req_1", user_name: "John Doe", category: "Deluxe", requested_date: "26032025", status: "approved" },
//             { _id: "req_2", user_name: "John Doe", category: "Standard", requested_date: "26032025", status: "approved" },
//             { _id: "req_3", user_name: "John Doe", category: "Deluxe", requested_date: "25032025", status: "rejected" },
//             { _id: "req_4", user_name: "John Doe", category: "Standard", requested_date: "27032025", status: "pending" },
//         ],
//         infoupdate: false
//     });
export const UserProvider = ({ children }) => {
  const [userData, setUserData] = useState(null);

    return (
        <UserContext.Provider value={{ userData, setUserData }}>
            {children}
        </UserContext.Provider>
    );
};

export const useUser = () => useContext(UserContext);