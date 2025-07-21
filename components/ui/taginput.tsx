import { useEffect, useState } from 'react'
import { Input } from '@/components/ui/input'
import { X } from 'lucide-react'
import { authFetch } from '@/lib/api'
import clsx from 'clsx'

const API_URL = process.env.API_BASE_URL || 'http://localhost:5000/api'

export default function TagInput({ tags, setTags }) {
  const [input, setInput] = useState('')
  const [suggestions, setSuggestions] = useState([])
  const [filtered, setFiltered] = useState([])
  const [showSuggestions, setShowSuggestions] = useState(false)

  useEffect(() => {
    const fetchSuggestions = async () => {
      try {
        const res = await authFetch(`${API_URL}/v1/pharmacy/medications`)
        const data = await res.json()
        const medNames = data?.data?.map(m => m.name) || []
        setSuggestions(medNames)
      } catch (err) {
        console.error('Failed to fetch medication suggestions', err)
      }
    }

    fetchSuggestions()
  }, [])

  const handleInputChange = (e) => {
    const value = e.target.value
    setInput(value)

    if (value.trim()) {
      const filtered = suggestions.filter(s =>
        s.toLowerCase().includes(value.toLowerCase())
      )
      setFiltered(filtered)
      setShowSuggestions(filtered.length > 0)
    } else {
      setShowSuggestions(false)
    }
  }

  const addTag = (medName) => {
  if (!tags.find(t => t?.name?.toLowerCase() === medName.toLowerCase())) {
    setTags([...tags, {
      name: medName,
      dosage: '',
      frequency: '',
      duration: ''
    }])
  }
  setInput('')
  setShowSuggestions(false)
}


  const handleKeyDown = (e) => {
    if ((e.key === 'Enter' || e.key === ',') && input.trim()) {
      e.preventDefault()
      addTag(input.trim())
    }
  }

  const removeTag = (index) => {
    const newTags = [...tags]
    newTags.splice(index, 1)
    setTags(newTags)
  }

  const updateTag = (index, field, value) => {
    const updated = [...tags]
    updated[index][field] = value
    setTags(updated)
  }

  return (
    <div className="relative space-y-2">
      <div className="min-h-[48px] flex flex-wrap gap-2 p-2 rounded-lg bg-white/60 dark:bg-white/10 backdrop-blur-md border border-gray-300 dark:border-gray-700 shadow-inner">
        {tags.map((tag, i) => (
          <div
            key={i}
            className="rounded-lg bg-blue-100 dark:bg-blue-900/40 text-sm px-3 py-2 space-y-1 text-blue-900 dark:text-blue-200 shadow-md w-full"
          >
            <div className="flex justify-between items-center font-semibold">
              <span>{tag.name}</span>
              <button onClick={() => removeTag(i)} className="ml-2 text-red-600 dark:text-red-400">
                <X size={14} />
              </button>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <Input
                placeholder="Dosage"
                value={tag?.dosage ?? ''}
                onChange={(e) => updateTag(i, 'dosage', e.target.value)}
                className="text-xs"
              />
              <Input
                placeholder="Frequency"
                value={tag?.frequency ?? ''}
                onChange={(e) => updateTag(i, 'frequency', e.target.value)}
                className="text-xs"
              />
              <Input
                placeholder="Duration"
                value={tag?.duration ?? ''}
                onChange={(e) => updateTag(i, 'duration', e.target.value)}
                className="text-xs"
              />
            </div>
          </div>
        ))}
        <input
          type="text"
          value={input}
          placeholder="Type med & press Enter"
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          className="flex-1 min-w-[120px] outline-none text-sm bg-transparent text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
        />
      </div>

      {showSuggestions && (
        <div className="absolute z-50 bg-white dark:bg-gray-900 w-full mt-1 max-h-48 overflow-auto border border-gray-300 dark:border-gray-700 rounded-md shadow-lg">
          {filtered.map((item, idx) => (
            <div
              key={idx}
              onClick={() => addTag(item)}
              className={clsx(
                "px-4 py-2 text-sm cursor-pointer hover:bg-blue-100 dark:hover:bg-blue-800/50",
                tags.find(t => t?.name?.toLowerCase() === item.toLowerCase()) && 'opacity-50 cursor-not-allowed'
              )}
            >
              {item}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
