import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { api } from '../api'

const defaults = { courseCode: '', rating: 5, comment: '' }

export default function ReviewForm() {
  const nav = useNavigate()
  const { id } = useParams()
  const [form, setForm] = useState(defaults)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!id) return

    async function loadReview() {
      try {
        const { data } = await api.get(`/reviews/${id}`)
        const { courseCode, rating, comment } = data.review
        setForm({ courseCode, rating, comment: comment || '' })
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load review')
      }
    }

    loadReview()
  }, [id])

  function onChange(e) {
    const { name, value } = e.target
    setForm((currentForm) => ({
      ...currentForm,
      [name]: name === 'rating' ? Number(value) : value
    }))
  }

  async function onSubmit(e) {
    e.preventDefault()
    setError('')

    try {
      if (id) {
        await api.patch(`/reviews/${id}`, form)
      } else {
        await api.post('/reviews', form)
      }
      nav('/reviews')
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save review')
    }
  }

  return (
    <div className="max-w-lg mx-auto card">
      <h1 className="text-xl font-semibold mb-4">{id ? 'Edit' : 'Write'} Review</h1>
      <form onSubmit={onSubmit} className="space-y-3">
        <label className="block">
          <span className="block text-sm font-medium mb-1">Course code</span>
          <input
            className="input w-full"
            name="courseCode"
            value={form.courseCode}
            onChange={onChange}
            placeholder="CS101"
            required
          />
        </label>

        <label className="block">
          <span className="block text-sm font-medium mb-1">Rating</span>
          <select
            className="input w-full"
            name="rating"
            value={form.rating}
            onChange={onChange}
          >
            {[1, 2, 3, 4, 5].map((rating) => (
              <option key={rating} value={rating}>{rating}</option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="block text-sm font-medium mb-1">Comment (optional)</span>
          <textarea
            className="input w-full"
            name="comment"
            value={form.comment}
            onChange={onChange}
            rows="4"
          />
        </label>
        {error && <div className="text-red-600 text-sm">{error}</div>}
        <button className="btn" type="submit">Save</button>
      </form>
    </div>
  )
}
