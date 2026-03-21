# NutriVision 🍏🥗

NutriVision is an AI-powered nutrition analysis web app that helps users understand what is on their plate in seconds.  
Built after completing a **2-day Outskill GenAI training program**, this project was created using **Google AI Studio** and vibe coding to explore how AI can be used in a real, practical product.

## What it does

- Upload a food image
- Analyze the meal using AI
- Estimate the food name and portion size
- Break down ingredients and approximate calories
- Show simple health tips and a clear explanation
- Ask follow-up questions through chat

## Features

- **Image-based food analysis**
- **Nutrition breakdown**
- **Calorie estimation**
- **Ingredient-level explanation**
- **AI follow-up chat**
- **Clean and modern UI**
- **Fast frontend experience with Vite**

## Tech Stack

- **Frontend:** React, TypeScript, Vite
- **AI:** Google AI Studio / Gemini API
- **UI Icons:** lucide-react
- **Charts:** recharts

## Project Structure

```bash
NutriVision/
├── components/
├── services/
├── App.tsx
├── index.tsx
├── types.ts
├── package.json
└── vite.config.ts

How it works:-
1.User uploads a food image.
2.The image is converted to Base64.
3.The AI service analyzes the image.
4.The app displays structured nutrition data.
5.The user can ask follow-up questions about the result.

Getting Started:-
1. Clone the repository
git clone https://github.com/shivamdwivedicse/NutriVision.git
cd NutriVision
2. Install dependencies
npm install
3. Add your API key

Create a local environment setup for your Gemini/Google AI key.

Note: for a Vite app, the safest approach is to store the key in a Vite environment variable and read it from import.meta.env.

4. Run the app
npm run dev

Why I built this

This project was created as part of my learning journey in GenAI.
After attending the Outskill training program, I wanted to turn that learning into something practical, creative, and useful. NutriVision is the result of that effort.

Future Improvements:-
Add better nutrition accuracy.
Add meal history / saved scans.
Add user profiles and goals.
Add a mobile-friendly PWA version.
Deploy it publicly.
Improve prompt engineering and error handling.
Add screenshots and a demo video.

Author
Made by Shivam Dwivedi.
