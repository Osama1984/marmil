// app/middleware.js (or app/middleware.ts for TypeScript)
import Cors from 'cors';
import { NextResponse } from 'next/server';

// Initialize the CORS middleware
const cors = Cors({
  methods: ['GET', 'POST', 'PUT', 'DELETE'],  // Allowed HTTP methods
  origin: 'https://marmil.vercel.app', // Replace with your allowed origin(s)
  allowedHeaders: ['Content-Type', 'Authorization'],  // Allowed headers
});

// Helper function to run middleware
function runMiddleware(req, res, fn) {
  return new Promise((resolve, reject) => {
    fn(req, res, (result) => {
      if (result instanceof Error) {
        return reject(result);
      }
      return resolve(result);
    });
  });
}

export async function middleware(req) {
  // Call the CORS middleware
  await runMiddleware(req, NextResponse.next(), cors);
  return NextResponse.next();
}
