import { supabase } from "../components/supabase.js";

export const protegerRuta = async () => {
  const { data: { session }, error } = await supabase.auth.getSession();
  if (error || !session || !session.user) {
    console.error("Error fetching session or user is not logged in:", error);
    window.location.href = "/loginUser"; // Redirigir al login si no está autenticado
  }
};
