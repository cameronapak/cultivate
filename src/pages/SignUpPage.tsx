import { Link } from 'react-router-dom'
import { SignupForm } from 'wasp/client/auth'
import Logo from '../components/custom/Logo'

export const SignupPage = () => {
  return (
    <main className="flex flex-col items-center justify-center h-screen">
      <Logo />
      <SignupForm appearance={{
        logo: {
          src: "/logo.png",
          alt: "Cultivate",
        },
      }} />
      <br />
      <span>
        I already have an account (<Link to="/login">go to login</Link>).
      </span>
    </main>
  )
}
