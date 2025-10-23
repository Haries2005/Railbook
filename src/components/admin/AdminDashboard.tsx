import React, { useState, useEffect } from 'react';
import { Plus, Edit, Train, Clock, MapPin, Trash2, X } from 'lucide-react';
import axios from 'axios';

const BACKEND_URL = 'http://localhost:5000';
interface AdminDashboardProps {
  onNavigate: (page: string) => void;
}

interface TrainClass {
  class_name: string;
  fare: number;
  available_seats: number;
}

interface Train {
  _id?: string;
  train_number: string;
  train_name: string;
  source_station: string;
  destination_station: string;
  departure_time: string;
  arrival_time: string;
  is_active?: boolean;
  classes: TrainClass[];
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ onNavigate }) => {
  const [trains, setTrains] = useState<Train[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingTrain, setEditingTrain] = useState<Train | null>(null);
  const [formData, setFormData] = useState<Train>({
    train_number: '',
    train_name: '',
    source_station: '',
    destination_station: '',
    departure_time: '',
    arrival_time: '',
    classes: [{ class_name: 'SL', fare: 500, available_seats: 72 }]
  });

  useEffect(() => {
    fetchTrains();
  }, []);

  const fetchTrains = async () => {
  try {
    setLoading(true);
    const response = await axios.get(`${BACKEND_URL}/api/trains`);
    setTrains(response.data);
  } catch (error) {
    console.error('Failed to fetch trains:', error);
  } finally {
    setLoading(false);
  }
};

  const resetForm = () => {
    setFormData({
      train_number: '',
      train_name: '',
      source_station: '',
      destination_station: '',
      departure_time: '',
      arrival_time: '',
      classes: [{ class_name: 'SL', fare: 500, available_seats: 72 }]
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const token = localStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : undefined;

      if (editingTrain && editingTrain._id) {
        await axios.put(`${BACKEND_URL}/api/trains/${editingTrain._id}`, formData, { headers });
        alert('✅ Train updated successfully!');
      } else {
        await axios.post(`${BACKEND_URL}/api/trains`, formData, { headers });
        alert('✅ Train added successfully!');
      }
      
      fetchTrains();
      setShowAddForm(false);
      setEditingTrain(null);
      resetForm();
    } catch (error: any) {
      console.error('Failed to save train:', error);
      alert('❌ Failed to save train: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleEdit = (train: Train) => {
    setFormData({
      train_number: train.train_number,
      train_name: train.train_name,
      source_station: train.source_station,
      destination_station: train.destination_station,
      departure_time: train.departure_time,
      arrival_time: train.arrival_time,
      classes: train.classes
    });
    setEditingTrain(train);
    setShowAddForm(true);
  };

  const handleDelete = async (trainId: string) => {
    if (!window.confirm('Are you sure you want to delete this train?')) return;
    
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${BACKEND_URL}/api/trains/${trainId}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined
      });
      alert('✅ Train deleted successfully!');
      fetchTrains();
    } catch (error: any) {
      console.error('Failed to delete train:', error);
      alert('❌ Failed to delete train: ' + (error.response?.data?.message || error.message));
    }
  };

  const addClassField = () => {
    setFormData({
      ...formData,
      classes: [...formData.classes, { class_name: '', fare: 0, available_seats: 0 }]
    });
  };

  const updateClass = (index: number, field: keyof TrainClass, value: string | number) => {
    const updatedClasses = [...formData.classes];
    updatedClasses[index] = { ...updatedClasses[index], [field]: value };
    setFormData({ ...formData, classes: updatedClasses });
  };

  const removeClass = (index: number) => {
    const updatedClasses = formData.classes.filter((_, i) => i !== index);
    setFormData({ ...formData, classes: updatedClasses });
  };

  if (loading) {
    return <div className="text-white text-center py-12">Loading trains...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Train Management</h1>
            <p className="text-slate-400">Manage trains, routes, and pricing</p>
          </div>
          <button
            onClick={() => {
              resetForm();
              setEditingTrain(null);
              setShowAddForm(true);
            }}
            className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium rounded-lg transition-all"
          >
            <Plus className="h-5 w-5" />
            <span>Add New Train</span>
          </button>
        </div>

        {showAddForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-white">
                  {editingTrain ? 'Edit Train' : 'Add New Train'}
                </h2>
                <button
                  onClick={() => {
                    setShowAddForm(false);
                    setEditingTrain(null);
                    resetForm();
                  }}
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Train Number
                    </label>
                    <input
                      type="text"
                      value={formData.train_number}
                      onChange={(e) => setFormData({ ...formData, train_number: e.target.value })}
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
                      value={formData.train_name}
                      onChange={(e) => setFormData({ ...formData, train_name: e.target.value })}
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
                      value={formData.source_station}
                      onChange={(e) => setFormData({ ...formData, source_station: e.target.value })}
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
                      value={formData.destination_station}
                      onChange={(e) => setFormData({ ...formData, destination_station: e.target.value })}
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
                      value={formData.departure_time}
                      onChange={(e) => setFormData({ ...formData, departure_time: e.target.value })}
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
                      value={formData.arrival_time}
                      onChange={(e) => setFormData({ ...formData, arrival_time: e.target.value })}
                      className="w-full px-3 py-3 border border-slate-600 rounded-lg bg-slate-700 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., 08:35+1"
                      required
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-white" >Classes        Fare        Seats</h3>
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
                          value={cls.class_name}
                          onChange={(e) => updateClass(index, 'class_name', e.target.value)}
                          className="px-3 py-2 border border-slate-600 rounded-lg bg-slate-700 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Class (e.g., 3A)"
                          required
                        />
                        <input
                          type="number"
                          value={cls.fare}
                          onChange={(e) => updateClass(index, 'fare', parseInt(e.target.value) || 0)}
                          className="px-3 py-2 border border-slate-600 rounded-lg bg-slate-700 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Fare"
                          required
                        />
                        <input
                          type="number"
                          value={cls.available_seats}
                          onChange={(e) => updateClass(index, 'available_seats', parseInt(e.target.value) || 0)}
                          className="px-3 py-2 border border-slate-600 rounded-lg bg-slate-700 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Seats"
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
                {trains.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-8 text-slate-400">
                      No trains found. Add your first train to get started!
                    </td>
                  </tr>
                ) : (
                  trains.map((train) => (
                    <tr key={train._id} className="hover:bg-slate-700/50 transition-colors">
                      <td className="py-4 px-6">
                        <div className="flex items-center space-x-3">
                          <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-2 rounded-lg">
                            <Train className="h-5 w-5 text-white" />
                          </div>
                          <div>
                            <p className="font-semibold text-white">{train.train_name}</p>
                            <p className="text-sm text-slate-400">#{train.train_number}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center space-x-2">
                          <MapPin className="h-4 w-4 text-blue-400" />
                          <span className="text-white text-sm">{train.source_station}</span>
                          <span className="text-slate-400">→</span>
                          <MapPin className="h-4 w-4 text-purple-400" />
                          <span className="text-white text-sm">{train.destination_station}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center space-x-2">
                          <Clock className="h-4 w-4 text-slate-400" />
                          <span className="text-white text-sm">
                            {train.departure_time} - {train.arrival_time}
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
                              {cls.class_name}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleEdit(train)}
                            className="flex items-center space-x-1 px-3 py-2 bg-slate-600 hover:bg-slate-500 text-white rounded-lg transition-all"
                          >
                            <Edit className="h-4 w-4" />
                            <span>Edit</span>
                          </button>
                          <button
                            onClick={() => train._id && handleDelete(train._id)}
                            className="flex items-center space-x-1 px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-all"
                          >
                            <Trash2 className="h-4 w-4" />
                            <span>Delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;