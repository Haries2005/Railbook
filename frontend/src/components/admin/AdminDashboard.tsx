import React, { useState } from 'react';
import { Plus, Edit, Train, Clock, MapPin, Users } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { Train as TrainType } from '../../contexts/AppContext';

interface AdminDashboardProps {
  onNavigate: (page: string) => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ onNavigate }) => {
  const { trains, addTrain, updateTrain } = useApp();
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingTrain, setEditingTrain] = useState<TrainType | null>(null);
  const [formData, setFormData] = useState({
    number: '',
    name: '',
    source: '',
    destination: '',
    departureTime: '',
    arrivalTime: '',
    classes: [{ name: 'SL', price: 500, available: 100 }]
  });

  const resetForm = () => {
    setFormData({
      number: '',
      name: '',
      source: '',
      destination: '',
      departureTime: '',
      arrivalTime: '',
      classes: [{ name: 'SL', price: 500, available: 100 }]
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingTrain) {
      updateTrain(editingTrain.id, formData);
      setEditingTrain(null);
    } else {
      addTrain(formData);
      setShowAddForm(false);
    }
    
    resetForm();
  };

  const handleEdit = (train: TrainType) => {
    setFormData({
      number: train.number,
      name: train.name,
      source: train.source,
      destination: train.destination,
      departureTime: train.departureTime,
      arrivalTime: train.arrivalTime,
      classes: train.classes
    });
    setEditingTrain(train);
    setShowAddForm(true);
  };

  const addClassField = () => {
    setFormData({
      ...formData,
      classes: [...formData.classes, { name: '', price: 0, available: 0 }]
    });
  };

  const updateClass = (index: number, field: string, value: string | number) => {
    const updatedClasses = [...formData.classes];
    updatedClasses[index] = { ...updatedClasses[index], [field]: value };
    setFormData({ ...formData, classes: updatedClasses });
  };

  const removeClass = (index: number) => {
    const updatedClasses = formData.classes.filter((_, i) => i !== index);
    setFormData({ ...formData, classes: updatedClasses });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Train Management</h1>
            <p className="text-slate-400">Manage trains, routes, and pricing</p>
          </div>
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium rounded-lg transition-all"
          >
            <Plus className="h-5 w-5" />
            <span>Add New Train</span>
          </button>
        </div>

        {/* Add/Edit Form Modal */}
        {showAddForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <h2 className="text-2xl font-bold text-white mb-6">
                {editingTrain ? 'Edit Train' : 'Add New Train'}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Train Number
                    </label>
                    <input
                      type="text"
                      value={formData.number}
                      onChange={(e) => setFormData({ ...formData, number: e.target.value })}
                      className="w-full px-3 py-3 border border-slate-600 rounded-lg bg-slate-700 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., 12301"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Train Name
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-3 py-3 border border-slate-600 rounded-lg bg-slate-700 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., Rajdhani Express"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Source Station
                    </label>
                    <input
                      type="text"
                      value={formData.source}
                      onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                      className="w-full px-3 py-3 border border-slate-600 rounded-lg bg-slate-700 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., New Delhi"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Destination Station
                    </label>
                    <input
                      type="text"
                      value={formData.destination}
                      onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
                      className="w-full px-3 py-3 border border-slate-600 rounded-lg bg-slate-700 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., Mumbai Central"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Departure Time
                    </label>
                    <input
                      type="text"
                      value={formData.departureTime}
                      onChange={(e) => setFormData({ ...formData, departureTime: e.target.value })}
                      className="w-full px-3 py-3 border border-slate-600 rounded-lg bg-slate-700 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., 16:55"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Arrival Time
                    </label>
                    <input
                      type="text"
                      value={formData.arrivalTime}
                      onChange={(e) => setFormData({ ...formData, arrivalTime: e.target.value })}
                      className="w-full px-3 py-3 border border-slate-600 rounded-lg bg-slate-700 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., 08:35+1"
                      required
                    />
                  </div>
                </div>

                {/* Classes */}
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-white">Classes</h3>
                    <button
                      type="button"
                      onClick={addClassField}
                      className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm transition-all"
                    >
                      Add Class
                    </button>
                  </div>
                  
                  <div className="space-y-3">
                    {formData.classes.map((cls, index) => (
                      <div key={index} className="grid grid-cols-4 gap-3 items-center">
                        <input
                          type="text"
                          value={cls.name}
                          onChange={(e) => updateClass(index, 'name', e.target.value)}
                          className="px-3 py-2 border border-slate-600 rounded-lg bg-slate-700 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Class (e.g., 3A)"
                          required
                        />
                        <input
                          type="number"
                          value={cls.price}
                          onChange={(e) => updateClass(index, 'price', parseInt(e.target.value) || 0)}
                          className="px-3 py-2 border border-slate-600 rounded-lg bg-slate-700 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Price"
                          required
                        />
                        <input
                          type="number"
                          value={cls.available}
                          onChange={(e) => updateClass(index, 'available', parseInt(e.target.value) || 0)}
                          className="px-3 py-2 border border-slate-600 rounded-lg bg-slate-700 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Available"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => removeClass(index)}
                          className="px-2 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-sm transition-all"
                          disabled={formData.classes.length === 1}
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Form Actions */}
                <div className="flex space-x-4 pt-4">
                  <button
                    type="submit"
                    className="flex-1 py-3 px-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium rounded-lg transition-all"
                  >
                    {editingTrain ? 'Update Train' : 'Add Train'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddForm(false);
                      setEditingTrain(null);
                      resetForm();
                    }}
                    className="flex-1 py-3 px-4 bg-slate-600 hover:bg-slate-500 text-white font-medium rounded-lg transition-all"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Trains Table */}
        <div className="bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-700">
                <tr>
                  <th className="text-left py-4 px-6 font-semibold text-white">Train Details</th>
                  <th className="text-left py-4 px-6 font-semibold text-white">Route</th>
                  <th className="text-left py-4 px-6 font-semibold text-white">Timing</th>
                  <th className="text-left py-4 px-6 font-semibold text-white">Classes</th>
                  <th className="text-left py-4 px-6 font-semibold text-white">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                {trains.map((train) => (
                  <tr key={train.id} className="hover:bg-slate-700/50 transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-3">
                        <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-2 rounded-lg">
                          <Train className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <p className="font-semibold text-white">{train.name}</p>
                          <p className="text-sm text-slate-400">#{train.number}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-2">
                        <MapPin className="h-4 w-4 text-blue-400" />
                        <span className="text-white text-sm">{train.source}</span>
                        <span className="text-slate-400">→</span>
                        <MapPin className="h-4 w-4 text-purple-400" />
                        <span className="text-white text-sm">{train.destination}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4 text-slate-400" />
                        <span className="text-white text-sm">
                          {train.departureTime} - {train.arrivalTime}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex flex-wrap gap-1">
                        {train.classes.map((cls, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-blue-600 text-white text-xs rounded"
                          >
                            {cls.name}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <button
                        onClick={() => handleEdit(train)}
                        className="flex items-center space-x-1 px-3 py-2 bg-slate-600 hover:bg-slate-500 text-white rounded-lg transition-all"
                      >
                        <Edit className="h-4 w-4" />
                        <span>Edit</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;