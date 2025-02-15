"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus } from "lucide-react"
import { createHabit } from "@/lib/habits"
import { useUser } from "@clerk/nextjs"

export function AddHabitDialog({ onHabitAdded }: { onHabitAdded: () => void }) {
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [frequency, setFrequency] = useState<"daily" | "weekly" | "monthly">("daily")
  const { user } = useUser()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user?.id) return

    try {
      await createHabit({
        user_id: user.id,
        title,
        description,
        frequency,
        target_completion: 1,
        color: '#' + Math.floor(Math.random()*16777215).toString(16)
      })
      onHabitAdded()
      setOpen(false)
      setTitle("")
      setDescription("")
      setFrequency("daily")
    } catch (error) {
      console.error('Error creating habit:', error)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" className="w-full justify-start text-gray-700 hover:text-emerald-600">
          <Plus className="mr-2 h-5 w-5" />
          Add New Habit
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Habit</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">Habit Name</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Morning Meditation"
              required
            />
          </div>
          <div>
            <Label htmlFor="description">Description (Optional)</Label>
            <Input
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g., 15 minutes of mindfulness"
            />
          </div>
          <div>
            <Label htmlFor="frequency">Frequency</Label>
            <Select value={frequency} onValueChange={(value: "daily" | "weekly" | "monthly") => setFrequency(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select frequency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button type="submit" className="w-full">Create Habit</Button>
        </form>
      </DialogContent>
    </Dialog>
  )
} 