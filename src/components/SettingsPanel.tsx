// import React, { useState } from 'react';
// import { useApp } from '../context/AppContext';
// import { formatCurrency, formatDate } from '../utils/helpers';

// export default function SettingsPanel() {
//   const { state, updateSettings } = useApp();
//   const [open, setOpen] = useState(false);
//   const [startDate, setStartDate] = useState(state.settings.agreementStartDate);
//   const [budget, setBudget] = useState(state.settings.totalAdvanceBudget.toString());

//   function save() {
//     updateSettings({
//       agreementStartDate: startDate,
//       totalAdvanceBudget: parseFloat(budget) || 260000,
//     });
//     setOpen(false);
//   }

//   return (
//     <div className="settings-panel">
//       {/* <button className="btn btn-ghost btn-sm" onClick={() => setOpen((v) => !v)} id="btn-settings">
//         ⚙️ Settings {open ? '▲' : '▼'}
//       </button> */}

//       {open && (
//         <div className="settings-box">
//           <h4>Agreement Settings</h4>
//           <div className="form-row">
//             <div className="form-group">
//               <label htmlFor="set-start-date">Agreement Start Date</label>
//               <input
//                 id="set-start-date"
//                 type="date"
//                 value={startDate}
//                 onChange={(e) => setStartDate(e.target.value)}
//               />
//             </div>
//             <div className="form-group">
//               <label htmlFor="set-budget">
//                 Total Advance Budget (Rs.)
//                 <span className="form-hint">Default: Rs. 260,000</span>
//               </label>
//               <input
//                 id="set-budget"
//                 type="number"
//                 min="0"
//                 step="1000"
//                 value={budget}
//                 onChange={(e) => setBudget(e.target.value)}
//               />
//             </div>
//           </div>
//           <div className="settings-info">
//             <span>Last saved: {formatDate(state.lastSaved?.split('T')[0] ?? null)}</span>
//           </div>
//           <div className="modal-footer">
//             <button className="btn btn-ghost" onClick={() => setOpen(false)}>Cancel</button>
//             <button className="btn btn-primary" onClick={save}>Save Settings</button>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }
