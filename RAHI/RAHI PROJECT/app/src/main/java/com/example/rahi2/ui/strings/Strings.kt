package com.example.rahi2.ui.strings

import androidx.compose.runtime.compositionLocalOf

enum class Language { EN, HI }

data class AppStrings(
	val appTitle: String,
	val homeSOS: String,
	val homeMap: String,
	val homeReportIncident: String,
	val profileTitle: String,
	val edit: String,
	val editProfile: String,
	val save: String,
	val cancel: String,
	val logout: String,
	val name: String,
	val email: String,
	val address: String,
	val phone: String,
	val incidentTitle: String,
	val incidentDesc: String,
	val incidentLocation: String,
	val incidentSubmit: String,
	val incidentSubmitted: String,
	val authWelcome: String,
	val authLogin: String,
	val authSignup: String,
	val homeTabLabel: String, // Added
	val profileTabLabel: String // Added
)

val EnglishStrings = AppStrings(
	appTitle = "Smart Tourist Safety",
	homeSOS = "SOS",
	homeMap = "Map",
	homeReportIncident = "Report Incident",
	profileTitle = "Profile",
	edit = "Edit",
	editProfile = "Edit Profile",
	save = "Save",
	cancel = "Cancel",
	logout = "Logout",
	name = "Name",
	email = "Email",
	address = "Address",
	phone = "Phone Number",
	incidentTitle = "Report Incident",
	incidentDesc = "Description",
	incidentLocation = "Location",
	incidentSubmit = "Submit",
	incidentSubmitted = "Incident submitted!",
	authWelcome = "Welcome",
	authLogin = "Login",
	authSignup = "Sign Up",
	homeTabLabel = "Home", // Added
	profileTabLabel = "Profile" // Added
)

val HindiStrings = AppStrings(
	appTitle = "स्मार्ट टूरिस्ट सेफ़्टी",
	homeSOS = "आपातकाल (SOS)",
	homeMap = "मानचित्र",
	homeReportIncident = "घटना रिपोर्ट",
	profileTitle = "प्रोफ़ाइल",
	edit = "संपादित करें",
	editProfile = "प्रोफ़ाइल संपादित करें",
	save = "सहेजें",
	cancel = "रद्द करें",
	logout = "लॉग आउट",
	name = "नाम",
	email = "ईमेल",
	address = "पता",
	phone = "फ़ोन नंबर",
	incidentTitle = "घटना रिपोर्ट",
	incidentDesc = "विवरण",
	incidentLocation = "स्थान",
	incidentSubmit = "जमा करें",
	incidentSubmitted = "घटना सबमिट की गई!",
	authWelcome = "स्वागत है",
	authLogin = "लॉगिन",
	authSignup = "साइन अप",
	homeTabLabel = "होम", // Added
	profileTabLabel = "प्रोफ़ाइल" // Added
)

val LocalStrings = compositionLocalOf { EnglishStrings }


