import { Link } from 'react-router-dom'
import { LoginForm } from 'wasp/client/auth'
import Logo from '../components/custom/Logo'

export const LoginPage = () => {
  return (
    <main className="flex flex-col items-center justify-center h-screen">
      <Logo />
      <LoginForm appearance={{
        logo: {
          src: "/logo.png",
          alt: "Cultivate",
        },
      }} />
      <br />
      <span>
        I don't have an account yet (<Link to="/signup">go to signup</Link>).
      </span>
    </main>
  )
}
