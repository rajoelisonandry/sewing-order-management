"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.supabase = void 0;
var supabase_js_1 = require("@supabase/supabase-js");
require("react-native-url-polyfill/auto");
var supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
var supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
exports.supabase = (0, supabase_js_1.createClient)(supabaseUrl, supabaseAnonKey);
