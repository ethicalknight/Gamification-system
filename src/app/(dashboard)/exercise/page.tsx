'use client';

import { useState } from 'react';
import { useExerciseStore } from '@/lib/store/exercise';
import { Activity, Dumbbell, Apple, Droplet, Flame, Target, Check, Plus, Trash2 } from 'lucide-react';
import { StatCard } from '@/components/shared/StatCard';
import { EmptyState } from '@/components/shared/EmptyState';
import { Modal } from '@/components/shared/Modal';

const WORKOUT_PLANS = {
  'Push/Pull/Legs': [
    { day: 'Push Day', exercises: [{ name: 'Bench Press', sets: 4, reps: '8-10' }, { name: 'Overhead Press', sets: 3, reps: '10' }, { name: 'Incline DB Press', sets: 3, reps: '10-12' }, { name: 'Tricep Pushdowns', sets: 3, reps: '12' }] },
    { day: 'Pull Day', exercises: [{ name: 'Deadlifts', sets: 4, reps: '6-8' }, { name: 'Barbell Rows', sets: 4, reps: '8-10' }, { name: 'Lat Pulldown', sets: 3, reps: '10-12' }, { name: 'Bicep Curls', sets: 3, reps: '12' }] },
    { day: 'Leg Day', exercises: [{ name: 'Squats', sets: 4, reps: '8-10' }, { name: 'Romanian DL', sets: 3, reps: '10' }, { name: 'Leg Press', sets: 3, reps: '12-15' }, { name: 'Calf Raises', sets: 4, reps: '15-20' }] },
  ],
  'Home': [
    { day: 'Upper Body', exercises: [{ name: 'Push-ups (Weighted)', sets: 4, reps: '12-15' }, { name: 'Pike Push-ups', sets: 3, reps: '10' }, { name: 'Pull-ups', sets: 4, reps: 'Max' }, { name: 'Diamond Push-ups', sets: 3, reps: '10' }] },
    { day: 'Lower Body', exercises: [{ name: 'Bodyweight Squats', sets: 4, reps: '20-25' }, { name: 'Bulgarian Split Squat', sets: 3, reps: '12 each' }, { name: 'Glute Bridges', sets: 3, reps: '20' }, { name: 'Calf Raises', sets: 4, reps: '25' }] },
  ],
  'Strength': [
    { day: 'Strength A', exercises: [{ name: 'Squat', sets: 5, reps: '5' }, { name: 'Bench Press', sets: 5, reps: '5' }, { name: 'Barbell Row', sets: 5, reps: '5' }] },
    { day: 'Strength B', exercises: [{ name: 'Squat', sets: 5, reps: '5' }, { name: 'Overhead Press', sets: 5, reps: '5' }, { name: 'Deadlift', sets: 1, reps: '5' }] },
  ],
} as const;

const DIET_PLANS = [
  { time: 'Breakfast (7am)', items: [{ food: 'Oats (100g)', cal: 350, protein: 12 }, { food: 'Banana (2)', cal: 180, protein: 2 }, { food: 'Milk (300ml)', cal: 150, protein: 10 }] },
  { time: 'Mid-Morning (10am)', items: [{ food: 'Peanut Butter (30g)', cal: 180, protein: 8 }, { food: 'Whole Wheat Toast', cal: 140, protein: 5 }] },
  { time: 'Lunch (1pm)', items: [{ food: 'Dal (150g cooked)', cal: 200, protein: 12 }, { food: 'Rice (200g cooked)', cal: 260, protein: 5 }, { food: 'Paneer (100g)', cal: 265, protein: 18 }] },
  { time: 'Snack (4pm)', items: [{ food: 'Soya Chunks (50g dry)', cal: 170, protein: 25 }, { food: 'Chana (100g boiled)', cal: 160, protein: 9 }] },
  { time: 'Dinner (8pm)', items: [{ food: 'Sprouts Salad (150g)', cal: 120, protein: 9 }, { food: 'Roti (3)', cal: 300, protein: 9 }, { food: 'Dal/Sabzi', cal: 200, protein: 8 }] },
];

type WorkoutType = keyof typeof WORKOUT_PLANS;

function getBmiClass(bmi: number) {
  if (bmi < 18.5) return { label: 'Underweight', color: 'text-chart-4' };
  if (bmi < 25) return { label: 'Normal', color: 'text-chart-2' };
  if (bmi < 30) return { label: 'Overweight', color: 'text-chart-1' };
  return { label: 'Obese', color: 'text-destructive' };
}

function MealModal({ open, onClose, onAdd }: { open: boolean; onClose: () => void; onAdd: (m: { name: string; calories: number; protein: number; time: string }) => void }) {
  const [form, setForm] = useState({ name: '', calories: '', protein: '', time: 'Breakfast' });
  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd({ name: form.name, calories: parseInt(form.calories) || 0, protein: parseInt(form.protein) || 0, time: form.time });
    setForm({ name: '', calories: '', protein: '', time: 'Breakfast' });
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title="Add Custom Meal" size="sm">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-muted-foreground uppercase mb-1">Meal Name</label>
          <input type="text" value={form.name} onChange={e => set('name', e.target.value)} className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:border-primary" required />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-muted-foreground uppercase mb-1">Calories (kcal)</label>
            <input type="number" value={form.calories} onChange={e => set('calories', e.target.value)} className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:border-primary" required />
          </div>
          <div>
            <label className="block text-xs font-bold text-muted-foreground uppercase mb-1">Protein (g)</label>
            <input type="number" value={form.protein} onChange={e => set('protein', e.target.value)} className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:border-primary" required />
          </div>
        </div>
        <div>
          <label className="block text-xs font-bold text-muted-foreground uppercase mb-1">Meal Time</label>
          <select value={form.time} onChange={e => set('time', e.target.value)} className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:border-primary">
            {['Breakfast', 'Mid-Morning', 'Lunch', 'Snack', 'Dinner', 'Other'].map(t => <option key={t}>{t}</option>)}
          </select>
        </div>
        <button type="submit" className="w-full bg-primary text-primary-foreground font-bold uppercase py-2.5 rounded-md hover:bg-primary/90">Add Meal</button>
      </form>
    </Modal>
  );
}

export default function ExerciseDashboard() {
  const { currentWeight, goalWeight, heightCm, meals, fitnessLogs, updateProfile, logDailyStats, addMeal, removeMeal } = useExerciseStore();

  const [tab, setTab] = useState<'overview' | 'workout' | 'diet' | 'log'>('overview');
  const [workoutType, setWorkoutType] = useState<WorkoutType>('Push/Pull/Legs');
  const [weightInput, setWeightInput] = useState(currentWeight.toString());
  const [logWeight, setLogWeight] = useState(currentWeight.toString());
  const [logWater, setLogWater] = useState('2');
  const [logWorkout, setLogWorkout] = useState(false);
  const [mealModalOpen, setMealModalOpen] = useState(false);

  const bmi = parseFloat((currentWeight / ((heightCm / 100) ** 2)).toFixed(1));
  const bmiClass = getBmiClass(bmi);
  const totalCal = meals.reduce((a, m) => a + m.calories, 0);
  const totalProtein = meals.reduce((a, m) => a + m.protein, 0);
  const TARGET_CAL = 2800;
  const TARGET_PROTEIN = 120;
  const weightToGoal = Math.max(0, goalWeight - currentWeight);

  const handleLog = () => {
    logDailyStats({ weight: parseFloat(logWeight), waterIntakeLiters: parseFloat(logWater), caloriesConsumed: totalCal, proteinConsumed: totalProtein, workoutCompleted: logWorkout });
    setLogWater('2'); setLogWorkout(false);
  };

  const TABS = [
    { id: 'overview', label: 'Overview' },
    { id: 'workout', label: 'Workouts' },
    { id: 'diet', label: 'Diet Plan' },
    { id: 'log', label: 'Daily Log' },
  ] as const;

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center gap-3">
        <Dumbbell className="w-7 h-7 text-primary" />
        <h1 className="text-3xl font-black tracking-tight uppercase">Fitness Engine</h1>
      </div>

      {/* Tab Nav */}
      <div className="flex gap-1 bg-card border border-border p-1 rounded-lg w-fit overflow-x-auto">
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} className={`text-xs font-bold px-4 py-1.5 rounded-md transition-colors whitespace-nowrap ${tab === t.id ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* OVERVIEW */}
      {tab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard label="Height" value={'6\'0" (183cm)'} color="text-chart-2" />
            <div className="bg-card border border-border p-4 rounded-lg flex flex-col gap-2">
              <div className="text-xs text-muted-foreground font-bold uppercase">Current Weight</div>
              <div className="flex items-center gap-2">
                <input type="number" step="0.1" value={weightInput} onChange={e => setWeightInput(e.target.value)} className="w-16 bg-background border border-border rounded px-2 py-1 text-xl font-black text-primary focus:border-primary focus:outline-none" />
                <span className="text-sm font-bold text-muted-foreground">kg</span>
              </div>
              <button onClick={() => updateProfile(parseFloat(weightInput) || currentWeight, goalWeight)} className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded hover:bg-primary/20 w-fit">Update</button>
            </div>
            <div className="bg-card border border-border p-4 rounded-lg">
              <div className="text-xs text-muted-foreground font-bold uppercase mb-1">BMI</div>
              <div className={`text-2xl font-black ${bmiClass.color}`}>{bmi}</div>
              <div className={`text-xs font-bold ${bmiClass.color}`}>{bmiClass.label}</div>
              <div className="w-full h-1.5 bg-accent rounded-full mt-2 overflow-hidden">
                <div className="h-full bg-chart-4" style={{ width: `${Math.min(100, (bmi / 35) * 100)}%` }} />
              </div>
            </div>
            <div className="bg-card border border-border p-4 rounded-lg">
              <div className="text-xs text-muted-foreground font-bold uppercase mb-1">Goal Progress</div>
              <div className="text-2xl font-black text-chart-4">{currentWeight}kg</div>
              <div className="text-xs text-muted-foreground">Target: {goalWeight}kg (+{weightToGoal.toFixed(1)}kg to go)</div>
              <div className="w-full h-1.5 bg-accent rounded-full mt-2 overflow-hidden">
                <div className="h-full bg-chart-4" style={{ width: `${Math.min(100, (currentWeight / goalWeight) * 100)}%` }} />
              </div>
            </div>
          </div>

          {/* Macro Summary */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-card border border-border p-4 rounded-lg">
              <div className="flex justify-between text-xs font-bold mb-2"><span className="text-muted-foreground uppercase">Calories Today</span><span className={totalCal >= TARGET_CAL ? 'text-chart-2' : 'text-chart-4'}>{totalCal} / {TARGET_CAL} kcal</span></div>
              <div className="w-full h-2 bg-accent rounded-full overflow-hidden"><div className="h-full bg-chart-2" style={{ width: `${Math.min(100, (totalCal / TARGET_CAL) * 100)}%` }} /></div>
            </div>
            <div className="bg-card border border-border p-4 rounded-lg">
              <div className="flex justify-between text-xs font-bold mb-2"><span className="text-muted-foreground uppercase">Protein Today</span><span className={totalProtein >= TARGET_PROTEIN ? 'text-chart-2' : 'text-primary'}>{totalProtein}g / {TARGET_PROTEIN}g</span></div>
              <div className="w-full h-2 bg-accent rounded-full overflow-hidden"><div className="h-full bg-primary" style={{ width: `${Math.min(100, (totalProtein / TARGET_PROTEIN) * 100)}%` }} /></div>
            </div>
          </div>

          {/* Recent Logs Sparkline */}
          {fitnessLogs.length > 0 && (
            <div className="bg-card border border-border p-4 rounded-lg">
              <h3 className="text-xs font-bold text-muted-foreground uppercase mb-3">Weight History (Last 7)</h3>
              <div className="flex items-end gap-2 h-16">
                {fitnessLogs.slice(-7).map((log, i) => {
                  const max = Math.max(...fitnessLogs.slice(-7).map(l => l.weight));
                  const min = Math.min(...fitnessLogs.slice(-7).map(l => l.weight));
                  const pct = max === min ? 50 : ((log.weight - min) / (max - min)) * 100;
                  return (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1">
                      <div className="w-full bg-primary/30 rounded-t" style={{ height: `${Math.max(10, pct)}%` }} />
                      <span className="text-[8px] text-muted-foreground">{log.weight}kg</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* WORKOUTS */}
      {tab === 'workout' && (
        <div className="space-y-6">
          <div className="flex gap-2 flex-wrap">
            {(Object.keys(WORKOUT_PLANS) as WorkoutType[]).map(type => (
              <button key={type} onClick={() => setWorkoutType(type)} className={`text-xs font-bold px-3 py-1.5 rounded border transition-colors ${workoutType === type ? 'bg-primary text-primary-foreground border-primary' : 'bg-card border-border text-muted-foreground hover:border-primary/50'}`}>
                {type}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {WORKOUT_PLANS[workoutType].map((plan) => (
              <div key={plan.day} className="bg-card border border-border rounded-lg p-4">
                <h3 className="font-bold text-sm uppercase tracking-wide text-primary mb-3">{plan.day}</h3>
                <div className="space-y-2">
                  {plan.exercises.map((ex, i) => (
                    <div key={i} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
                      <span className="text-sm font-medium">{ex.name}</span>
                      <span className="text-xs font-mono text-muted-foreground bg-muted px-2 py-0.5 rounded">{ex.sets} × {ex.reps}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* DIET */}
      {tab === 'diet' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-sm font-bold uppercase tracking-widest text-primary flex items-center gap-2"><Apple className="w-4 h-4" /> Indian Vegetarian Plan</h2>
            <button onClick={() => setMealModalOpen(true)} className="flex items-center gap-1 text-xs font-bold bg-primary text-primary-foreground px-3 py-1.5 rounded hover:bg-primary/80">
              <Plus className="w-3.5 h-3.5" /> Add Meal
            </button>
          </div>
          <MealModal open={mealModalOpen} onClose={() => setMealModalOpen(false)} onAdd={m => addMeal(m)} />

          {/* Custom Meals */}
          {meals.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-xs font-bold text-muted-foreground uppercase">Today's Custom Meals</h3>
              {meals.map(m => (
                <div key={m.id} className="flex items-center justify-between p-3 border border-border rounded-lg bg-card hover:border-primary/30 transition-colors">
                  <div>
                    <div className="font-bold text-sm">{m.name}</div>
                    <div className="text-[10px] text-primary bg-primary/10 px-1.5 py-0.5 rounded w-fit mt-0.5">{m.time}</div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="text-sm font-black flex items-center gap-1"><Flame className="w-3 h-3 text-chart-4" />{m.calories}</div>
                      <div className="text-[10px] text-muted-foreground">{m.protein}g prot</div>
                    </div>
                    <button onClick={() => removeMeal(m.id)} className="text-muted-foreground hover:text-destructive"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Suggested Plan */}
          <h3 className="text-xs font-bold text-muted-foreground uppercase mt-2">Suggested Full-Day Plan (Veg)</h3>
          <div className="space-y-3">
            {DIET_PLANS.map(plan => {
              const mealCal = plan.items.reduce((a, i) => a + i.cal, 0);
              const mealProt = plan.items.reduce((a, i) => a + i.protein, 0);
              return (
                <div key={plan.time} className="bg-card border border-border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-bold">{plan.time}</h4>
                    <div className="flex gap-3 text-[10px] font-mono text-muted-foreground">
                      <span className="text-chart-4">{mealCal} kcal</span>
                      <span className="text-primary">{mealProt}g protein</span>
                    </div>
                  </div>
                  <div className="space-y-1">
                    {plan.items.map(item => (
                      <div key={item.food} className="flex justify-between text-xs text-muted-foreground">
                        <span>{item.food}</span>
                        <span className="font-mono">{item.cal}kcal / {item.protein}g P</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
          <div className="bg-muted/30 border border-border rounded-lg p-3 text-xs text-muted-foreground font-mono">
            Total: ~{DIET_PLANS.reduce((a, p) => a + p.items.reduce((b, i) => b + i.cal, 0), 0)} kcal / ~{DIET_PLANS.reduce((a, p) => a + p.items.reduce((b, i) => b + i.protein, 0), 0)}g protein per day. Adjust portions for weight gain.
          </div>
        </div>
      )}

      {/* DAILY LOG */}
      {tab === 'log' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-card border border-border p-6 rounded-lg space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-widest text-primary">Log Today</h2>
            <div>
              <label className="block text-xs font-bold text-muted-foreground uppercase mb-1 flex items-center gap-1"><Target className="w-3 h-3" /> Weight (kg)</label>
              <input type="number" step="0.1" value={logWeight} onChange={e => setLogWeight(e.target.value)} className="w-full bg-background border border-border rounded px-3 py-2 text-sm focus:border-primary focus:outline-none" />
            </div>
            <div>
              <label className="block text-xs font-bold text-muted-foreground uppercase mb-1 flex items-center gap-1"><Droplet className="w-3 h-3 text-blue-400" /> Water (Liters)</label>
              <input type="number" step="0.5" value={logWater} onChange={e => setLogWater(e.target.value)} className="w-full bg-background border border-border rounded px-3 py-2 text-sm focus:border-primary focus:outline-none" />
            </div>
            <div className="flex items-center gap-3 pt-2">
              <div onClick={() => setLogWorkout(!logWorkout)} className={`w-6 h-6 rounded border flex items-center justify-center cursor-pointer transition-colors ${logWorkout ? 'bg-primary border-primary' : 'bg-background border-muted-foreground'}`}>
                {logWorkout && <Check className="w-4 h-4 text-background" />}
              </div>
              <label className="text-sm font-bold uppercase cursor-pointer" onClick={() => setLogWorkout(!logWorkout)}>Workout Completed</label>
            </div>
            <button onClick={handleLog} className="w-full bg-primary text-primary-foreground font-bold uppercase py-2.5 rounded hover:bg-primary/90 transition-colors">Save Log Entry</button>
          </div>

          <div className="bg-card border border-border rounded-lg overflow-hidden">
            <div className="p-4 border-b border-border"><h3 className="text-sm font-bold uppercase">Recent Logs</h3></div>
            <div className="p-4 space-y-3">
              {fitnessLogs.length === 0 ? (
                <EmptyState icon={Activity} message="No logs yet." />
              ) : (
                [...fitnessLogs].reverse().slice(0, 10).map(log => (
                  <div key={log.id} className="flex items-center justify-between text-sm border-b border-border/40 pb-2">
                    <div className="font-mono text-xs text-muted-foreground">{new Date(log.date).toLocaleDateString('en-IN')}</div>
                    <div className="font-bold text-primary">{log.weight}kg</div>
                    <div className="text-xs text-muted-foreground">{log.waterIntakeLiters}L</div>
                    <div className="flex gap-1">
                      {log.workoutCompleted && <Dumbbell className="w-3.5 h-3.5 text-chart-2" />}
                      {log.waterIntakeLiters >= 3 && <Droplet className="w-3.5 h-3.5 text-blue-400" />}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
