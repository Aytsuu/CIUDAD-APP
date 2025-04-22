import supabase from "@/utils/supabase";
import { useState, useEffect } from "react";

export default function NotificationComponent(){
    
    const [notifications, setNotifications] = useState([]);
    const user = supabase.auth.user();

}   