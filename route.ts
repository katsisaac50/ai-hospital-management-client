// app/api/auth/[...nextauth]/route.ts
import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import GitHubProvider from "next-auth/providers/github";
import CredentialsProvider from "next-auth/providers/credentials";
import { API_BASE_URL } from '@/config'

// Define types for better type safety
type UserRole = "admin" | "doctor" | "nurse" | "patient" | "user";

interface CustomUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

interface CustomToken {
  role: UserRole;
  id: string;
  [key: string]: any;
}

interface CustomSession {
  user: {
    id: string;
    name: string;
    email: string;
    role: UserRole;
    [key: string]: any;
  };
}

const handler = NextAuth({
  providers: [
    // Google OAuth provider
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    
    // GitHub OAuth provider
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    }),
    
    // Credentials provider for email/password login
    CredentialsProvider({
      name: "Hospital Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const { email, password } = credentials ?? {};
        
        // In a real app, replace this with database logic:
        // 1. Query your database to find the user
        // 2. Verify the password (using bcrypt)
        // 3. Return the user object or null if invalid
        
        // Mock users - replace with actual database queries
        // const mockUsers = [
        //   {
        //     id: "1",
        //     name: "Admin User",
        //     email: "admin@hospital.com",
        //     password: "secret123", // In real app, store hashed passwords
        //     role: "admin" as UserRole,
        //   },
        //   {
        //     id: "2",
        //     name: "Doctor User",
        //     email: "doctor@hospital.com",
        //     password: "doctor123",
        //     role: "doctor" as UserRole,
        //   },
        // ];

        // const user = mockUsers.find((user) => user.email === email);
        
        // if (user && user.password === password) {
        //   return {
        //     id: user.id,
        //     name: user.name,
        //     email: user.email,
        //     role: user.role,
        //   };
        // }

        // ✅ Log API_BASE_URL to verify
        console.log("API_BASE_URL at runtime:", API_BASE_URL);

        try {
          const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ email, password }),
          });
          console.log("Response from login:", response);
        
          if (!response.ok) {
            console.error("Login failed:", await response.text());
            return null;
          }
        
          const user = await response.json();
        console.log("katongole", user);
          // Return user object that will be added to the JWT
          return {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            accessToken: user.token
          };
        } catch (err) {
          console.error("Error authorizing user:", err);
          return null;
        }
        
      },
    }),
  ],
  
  // Custom pages
  pages: {
    signIn: "/login",       // Custom login page
    error: "/auth/error",   // Error page for authentication errors
  },
  
  // Session configuration
  session: {
    strategy: "jwt",        // Use JWT for sessions (recommended)
    maxAge: 30 * 24 * 60 * 60, // 30 days session duration
    updateAge: 24 * 60 * 60,   // Update session every 24 hours
  },
  
  // Callbacks to customize JWT and session
  callbacks: {
    async jwt({ token, user, account }): Promise<CustomToken> {
      // Add user role and id to the token right after sign in
      if (user) {
        token.role = (user as CustomUser).role ?? "user";
        token.id = user.id;
        token.accessToken = user.accessToken;
      }
      
      // If this is a social login, you might want to handle it differently
      if (account?.provider === "google" || account?.provider === "github") {
        // You might want to create or find the user in your database here
        // and assign a default role
        token.role = token.role ?? "user";
      }
      
      return token;
    },
    
    async session({ session, token }): Promise<CustomSession> {
      // Add role and id to the session object
      if (session.user) {
        session.user.role = token.role as UserRole;
        session.user.id = token.id as string;
        session.user.accessToken = token.accessToken;

      }
      return session;
    },
    
    // Optional: Redirect after sign in
    async redirect({ url, baseUrl }) {
      // Allows relative callback URLs
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      // Allows callback URLs on the same origin
      else if (new URL(url).origin === baseUrl) return url;
      return baseUrl;
    },
  },
  
  // Security settings
  secret: process.env.NEXTAUTH_SECRET,
  
  // Enable debug messages in development
  debug: process.env.NODE_ENV === "development",
  
  // Events logging (optional)
  events: {
    async signIn({ user, account, isNewUser }) {
      // Log sign-in events
      if (isNewUser) {
        console.log(`New user ${user.email} signed in via ${account?.provider}`);
      } else {
        console.log(`User ${user.email} signed in via ${account?.provider}`);
      }
      // console.log(`User ${user.email} signed in via ${account?.provider}`);
    },
    async signOut({ token, session }) {
      console.log(`User ${token.email} signed out`);
    },
  },
});

export { handler as GET, handler as POST };