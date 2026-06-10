import { useState } from 'react';
import type { UserProfile } from '../types';

interface Props {
  profile: UserProfile | null;
  onProfileChange: (profile: UserProfile | null) => void;
  useImperial: boolean;
  onUseImperialChange: (val: boolean) => void;
}

const KG_TO_LB = 2.20462;
const CM_TO_IN = 0.393701;
const LB_TO_KG = 1 / KG_TO_LB;
const IN_TO_CM = 1 / CM_TO_IN;

function toDisplayWeight(kg: number, imperial: boolean): number {
  return imperial ? Math.round(kg * KG_TO_LB) : kg;
}

function toDisplayHeight(cm: number, imperial: boolean): number {
  return imperial ? Math.round(cm * CM_TO_IN) : cm;
}

function toKg(val: number, imperial: boolean): number {
  return imperial ? Math.round(val * LB_TO_KG * 10) / 10 : val;
}

function toCm(val: number, imperial: boolean): number {
  return imperial ? Math.round(val * IN_TO_CM * 10) / 10 : val;
}

interface FormState {
  gender: 'male' | 'female';
  age: string;
  weight: string;
  height: string;
}

export function UserProfileSection({ profile, onProfileChange, useImperial, onUseImperialChange }: Props) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<FormState>({ gender: 'male', age: '30', weight: '70', height: '170' });

  function startEditing() {
    if (profile) {
      setForm({
        gender: profile.gender,
        age: String(profile.age),
        weight: String(toDisplayWeight(profile.weightKg, useImperial)),
        height: String(toDisplayHeight(profile.heightCm, useImperial)),
      });
    } else {
      setForm({
        gender: 'male',
        age: '30',
        weight: useImperial ? '154' : '70',
        height: useImperial ? '67' : '170',
      });
    }
    setEditing(true);
  }

  function save() {
    const age = parseFloat(form.age) || 30;
    const weight = parseFloat(form.weight) || 70;
    const height = parseFloat(form.height) || 170;
    onProfileChange({
      gender: form.gender,
      age: Math.max(1, age),
      weightKg: toKg(Math.max(1, weight), useImperial),
      heightCm: toCm(Math.max(1, height), useImperial),
    });
    setEditing(false);
  }

  function cancel() {
    setEditing(false);
  }

  if (!profile && !editing) {
    return (
      <div className="bg-gray-800/50 rounded-lg border border-gray-700 p-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-gray-100">Personalize Targets</h2>
            <p className="text-xs text-gray-500 mt-0.5">Set your profile to get personalized RDA values</p>
          </div>
          <button
            onClick={startEditing}
            className="text-sm text-blue-400 hover:text-blue-300 transition-colors px-3 py-1.5 border border-gray-700 rounded-md hover:border-gray-600"
          >
            Set Profile
          </button>
        </div>
      </div>
    );
  }

  if (editing) {
    return (
      <div className="bg-gray-800/50 rounded-lg border border-gray-700 p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-gray-100">Edit Profile</h2>
          <button
            onClick={() => onUseImperialChange(!useImperial)}
            className="text-xs text-gray-400 hover:text-gray-200 transition-colors px-2 py-0.5 border border-gray-700 rounded"
          >
            {useImperial ? 'lb / in' : 'kg / cm'}
          </button>
        </div>
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <label className="text-xs text-gray-400">Gender</label>
            <select
              value={form.gender}
              onChange={e => setForm(f => ({ ...f, gender: e.target.value as 'male' | 'female' }))}
              className="bg-gray-900 border border-gray-600 rounded px-2 py-1 text-sm text-gray-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-xs text-gray-400">Age</label>
            <input
              type="number"
              min="1"
              max="120"
              value={form.age}
              onChange={e => setForm(f => ({ ...f, age: e.target.value }))}
              className="w-14 px-2 py-1 bg-gray-900 border border-gray-600 rounded text-sm text-right text-gray-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-xs text-gray-400">Weight</label>
            <input
              type="number"
              min="1"
              value={form.weight}
              onChange={e => setForm(f => ({ ...f, weight: e.target.value }))}
              className="w-16 px-2 py-1 bg-gray-900 border border-gray-600 rounded text-sm text-right text-gray-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            <span className="text-[10px] text-gray-500">{useImperial ? 'lb' : 'kg'}</span>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-xs text-gray-400">Height</label>
            <input
              type="number"
              min="1"
              value={form.height}
              onChange={e => setForm(f => ({ ...f, height: e.target.value }))}
              className="w-16 px-2 py-1 bg-gray-900 border border-gray-600 rounded text-sm text-right text-gray-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            <span className="text-[10px] text-gray-500">{useImperial ? 'in' : 'cm'}</span>
          </div>
          <div className="flex items-center gap-2 ml-auto">
            <button
              onClick={save}
              className="px-3 py-1 text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
            >
              Save
            </button>
            <button
              onClick={cancel}
              className="px-3 py-1 text-sm text-gray-400 hover:text-gray-200 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800/50 rounded-lg border border-gray-700 p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4 text-sm text-gray-300">
          <h2 className="text-sm font-semibold text-gray-100">Profile</h2>
          <span>{profile!.gender === 'male' ? 'Male' : 'Female'}, {profile!.age}y</span>
          <span>{toDisplayWeight(profile!.weightKg, useImperial)} {useImperial ? 'lb' : 'kg'}</span>
          <span>{toDisplayHeight(profile!.heightCm, useImperial)} {useImperial ? 'in' : 'cm'}</span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => onUseImperialChange(!useImperial)}
            className="text-xs text-gray-400 hover:text-gray-200 transition-colors px-2 py-0.5 border border-gray-700 rounded"
          >
            {useImperial ? 'lb / in' : 'kg / cm'}
          </button>
          <button
            onClick={startEditing}
            className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
          >
            Edit
          </button>
          <button
            onClick={() => onProfileChange(null)}
            className="text-xs text-gray-500 hover:text-gray-300 transition-colors"
          >
            Clear
          </button>
        </div>
      </div>
    </div>
  );
}
