import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://bnvhzzbsqixwyevhgcol.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJudmh6emJzcWl4d3lldmhnY29sIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI1ODkwMDEsImV4cCI6MjA1ODE2NTAwMX0.CaEU6OAV3BjTZ0Lh5TDTRkHzqKQmoHlbZ2dBOlDsEjs";

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);