import { Routes, Route } from 'react-router-dom'
import NavBar from './components/NavBar'
import Home from './pages/Home'
import Profile from './pages/Profile'
import Settings from './pages/Settings'
import NotFound from './pages/NotFound'
import LogIn from './pages/LogIn'

function App() {
  return (
    <div className='flex flex-col h-full'>
      <NavBar />
      <div className="flex grow">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path='/login' element={<LogIn />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
    </div>
  )
}

export default App
