import { useState, useEffect } from 'react';
import { Package, Plus } from 'lucide-react';
import { Card } from '../components/Card';

interface InventoryItem {
  id: string;
  name: string;
  category: string;
  inStock: boolean;
}

export function CatalogView() {
  const [items, setItems] = useState<InventoryItem[]>(() => {
    const saved = localStorage.getItem('inventoryItems');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { return []; }
    }
    return [];
  });
  
  useEffect(() => {
    localStorage.setItem('inventoryItems', JSON.stringify(items));
  }, [items]);
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState('');
  const [newCat, setNewCat] = useState('Fertilizer');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName) return;
    setItems([{
      id: Date.now().toString(),
      name: newName,
      category: newCat,
      inStock: true
    }, ...items]);
    setShowAdd(false);
    setNewName('');
  };

  const toggleStock = (id: string) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, inStock: !item.inStock } : item
      )
    );
  };

  return (
    <div style={{ padding: '1.25rem 1.25rem 0' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
        <div>
          <p style={{ fontSize: '0.75rem', letterSpacing: '0.05em', color: 'var(--color-text-light)', marginBottom: '0.25rem', textTransform: 'uppercase' }}>
            Materials & Supplies
          </p>
          <h2 style={{ fontSize: '1.5rem', margin: 0 }}>Inventory Management</h2>
        </div>
        <button 
          onClick={() => setShowAdd(true)}
          style={{
          backgroundColor: 'var(--color-primary)',
          color: 'white', border: 'none',
          borderRadius: '50%', width: '40px', height: '40px',
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <Plus size={20} />
        </button>
      </div>

      {showAdd && (
        <Card style={{ padding: '1.25rem', marginBottom: '1rem', backgroundColor: '#f8fafc' }}>
          <h3 style={{ margin: '0 0 1rem', fontSize: '1.1rem' }}>Add New Item</h3>
          <form onSubmit={handleAdd} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
               <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.25rem', color: 'var(--color-neutral)' }}>Item Name</label>
               <input type="text" value={newName} onChange={e => setNewName(e.target.value)} required placeholder="e.g. Copper Fungicide" style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--color-border)', fontSize: '0.9rem' }} />
            </div>
            <div>
               <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.25rem', color: 'var(--color-neutral)' }}>Category</label>
               <select value={newCat} onChange={e => setNewCat(e.target.value)} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--color-border)', fontSize: '0.9rem', backgroundColor: 'white' }}>
                 <option value="Fertilizer">Fertilizer</option>
                 <option value="Seeds">Seeds</option>
                 <option value="Treatments">Treatments</option>
                 <option value="Hardware">Hardware</option>
               </select>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button type="submit" style={{ flex: 1, backgroundColor: 'var(--color-primary)', color: 'white', padding: '0.75rem', border: 'none', borderRadius: '8px', fontWeight: 700 }}>Add</button>
              <button type="button" onClick={() => setShowAdd(false)} style={{ flex: 1, backgroundColor: 'white', color: 'var(--color-neutral)', padding: '0.75rem', border: '1px solid var(--color-border)', borderRadius: '8px', fontWeight: 600 }}>Cancel</button>
            </div>
          </form>
        </Card>
      )}

      {items.length === 0 && !showAdd && (
        <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--color-text-light)' }}>
          <Package size={48} style={{ opacity: 0.3, marginBottom: '1rem' }} />
          <p style={{ margin: 0, fontSize: '0.9rem' }}>0 items in inventory.<br/>Add your first supplies using the plus button.</p>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', paddingBottom: '2rem' }}>
        {items.map((item) => (
          <Card key={item.id} style={{ padding: '1rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{
              width: '40px', height: '40px',
              backgroundColor: item.inStock ? 'rgba(0, 35, 102, 0.08)' : 'rgba(239, 68, 68, 0.08)',
              borderRadius: '10px',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <Package size={20} color={item.inStock ? 'var(--color-primary)' : '#EF4444'} />
            </div>
            
            <div style={{ flex: 1 }}>
              <h3 style={{ fontSize: '1rem', margin: '0 0 0.25rem', fontWeight: 700 }}>{item.name}</h3>
              <span style={{ fontSize: '0.75rem', color: 'var(--color-text-light)', backgroundColor: 'var(--color-background)', padding: '2px 6px', borderRadius: '4px' }}>
                {item.category}
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
              <span style={{ fontSize: '0.65rem', fontWeight: 700, color: item.inStock ? 'var(--color-success)' : '#EF4444' }}>
                {item.inStock ? 'IN STOCK' : 'OUT'}
              </span>
              <button 
                onClick={() => toggleStock(item.id)}
                style={{
                  width: '36px', height: '20px',
                  borderRadius: '10px',
                  backgroundColor: item.inStock ? 'var(--color-success)' : 'var(--color-border)',
                  border: 'none', position: 'relative', cursor: 'pointer',
                  transition: 'background-color 0.2s'
                }}
              >
                <div style={{
                  width: '16px', height: '16px', borderRadius: '50%',
                  backgroundColor: 'white', position: 'absolute', top: '2px',
                  left: item.inStock ? '18px' : '2px',
                  transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
                }} />
              </button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
