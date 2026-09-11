import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ListAPI } from '../api';
import { Plus, List as ListIcon, Loader2, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 300, damping: 24 } }
};

export function Lists() {
  const [lists, setLists] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  
  const { currentUser } = useAuth();

  const fetchLists = async () => {
    try {
      const res = await ListAPI.getLists();
      setLists(res || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser) {
      fetchLists();
    } else {
      setLoading(false);
    }
  }, [currentUser]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setSubmitting(true);
    try {
      await ListAPI.createList(name, description);
      setShowModal(false);
      setName('');
      setDescription('');
      fetchLists();
    } catch (e) {
      console.error(e);
      alert('Failed to create list');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="min-h-screen bg-sentix-bg flex items-center justify-center text-sentix-text"><Loader2 className="w-8 h-8 animate-spin" /></div>;
  }

  return (
    <div className="w-full font-sans">
      <main className="max-w-6xl mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-8 border-b border-sentix-border pb-4">
          <div className="flex items-center space-x-3">
            <ListIcon className="w-6 h-6 text-sentix-text" />
            <h1 className="text-2xl font-bold text-white uppercase tracking-wider">Your Lists</h1>
          </div>
          <button 
            onClick={() => setShowModal(true)}
            className="bg-sentix-green text-sentix-bg px-4 py-2 rounded-md font-bold hover:bg-sentix-greenHover transition-colors flex items-center shadow-md"
          >
            <Plus className="w-4 h-4 mr-1" /> New List
          </button>
        </div>

        {lists.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-sentix-panel p-12 rounded-2xl border border-sentix-border text-center shadow-lg"
          >
            <ListIcon className="w-12 h-12 text-sentix-border mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">No lists yet</h3>
            <p className="text-sentix-text mb-6">Create your first list to start tracking films.</p>
            <button 
              onClick={() => setShowModal(true)}
              className="bg-sentix-green text-sentix-bg px-6 py-3 rounded-md font-bold hover:bg-sentix-greenHover transition-colors"
            >
              Start a List
            </button>
          </motion.div>
        ) : (
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {lists.map(list => (
              <motion.div key={list.id} variants={itemVariants}>
                <Link 
                  to={`/lists/${list.id}`} 
                  className="block bg-sentix-panel border border-sentix-border p-6 rounded-2xl hover:border-sentix-green hover:shadow-[0_0_20px_rgba(0,224,84,0.1)] transition-all group h-full"
                >
                  <h3 className="text-xl font-bold text-white mb-2 group-hover:text-sentix-green transition-colors">{list.name}</h3>
                  {list.description && <p className="text-sentix-text text-sm mb-4 line-clamp-2">{list.description}</p>}
                  <div className="mt-auto pt-4 flex items-center justify-between border-t border-sentix-border/50">
                    <div className="text-xs font-bold text-sentix-green uppercase tracking-wider">
                      {list._count?.movies || 0} Films
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        )}
      </main>

      <AnimatePresence>
        {showModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[100] p-4"
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-sentix-panel rounded-2xl border border-sentix-border shadow-2xl w-full max-w-md p-6 relative overflow-hidden"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-white">Create New List</h2>
                <button onClick={() => setShowModal(false)} className="text-sentix-text hover:text-white transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form onSubmit={handleCreate}>
                <div className="mb-4">
                  <label className="block text-xs font-bold text-sentix-text uppercase tracking-wider mb-2">List Name</label>
                  <input 
                    type="text" 
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="w-full bg-sentix-bg border border-sentix-border rounded-xl p-3 text-white focus:border-sentix-green focus:ring-1 focus:ring-sentix-green transition-all outline-none"
                    placeholder="e.g. Favorite Sci-Fi"
                    required
                  />
                </div>
                <div className="mb-6">
                  <label className="block text-xs font-bold text-sentix-text uppercase tracking-wider mb-2">Description (Optional)</label>
                  <textarea 
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    className="w-full h-24 bg-sentix-bg border border-sentix-border rounded-xl p-3 text-white focus:border-sentix-green focus:ring-1 focus:ring-sentix-green transition-all outline-none resize-none"
                  ></textarea>
                </div>
                <div className="flex justify-end space-x-3">
                  <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-sentix-text hover:text-white font-bold transition-colors">Cancel</button>
                  <button type="submit" disabled={submitting || !name.trim()} className="px-6 py-2 bg-sentix-green text-sentix-bg rounded-lg font-bold hover:bg-sentix-greenHover disabled:opacity-50 flex items-center transition-colors">
                    {submitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                    Save List
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
