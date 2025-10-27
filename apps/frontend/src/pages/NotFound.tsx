import { Link } from 'react-router-dom'

function NotFound() {
  return (
    <div className="container mx-auto p-6 text-center">
      <h1 className="text-6xl font-bold mb-4">404</h1>
      <p className="text-2xl mb-6">Page Not Found</p>
      <Link to="/" className="btn btn-primary">
        Go Back Home
      </Link>
    </div>
  )
}

export default NotFound
