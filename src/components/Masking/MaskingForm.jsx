import React from 'react';
import Button from '../Common/Button';
import './Masking.css';

const MaskingForm = ({ data, onChange, options, onOptionsChange, onSubmit }) => {
  const handleChange = (field, value) => {
    onChange({ ...data, [field]: value });
  };

  const handleOptionChange = (field, value) => {
    onOptionsChange({ ...options, [field]: value });
  };

  const isFormEmpty = !Object.values(data).some(val => val.length > 0);

  return (
    <div className="masking-form card">
      <div className="form-section">
        <h3>Configurazione</h3>
        <div className="form-row">
          <div className="form-group">
            <label>Tipo Polizza</label>
            <select
              value={options.policyType}
              onChange={(e) => handleOptionChange('policyType', e.target.value)}
            >
              <option value="rc_generale">RC Generale</option>
              <option value="incendio">Incendio</option>
              <option value="trasporti">Trasporti</option>
            </select>
          </div>
          <div className="form-group">
            <label>Livello Analisi</label>
            <select
              value={options.analysisLevel}
              onChange={(e) => handleOptionChange('analysisLevel', e.target.value)}
            >
              <option value="cliente">Cliente</option>
              <option value="compagnia">Compagnia</option>
              <option value="sinistro">Sinistro</option>
            </select>
          </div>
        </div>
      </div>

      <div className="form-section">
        <h3>Dati da Mascherare (Anonimizzazione)</h3>
        <p className="help-text">Inserisci i dati sensibili da evidenziare e mascherare nell'analisi.</p>

        <div className="form-group">
          <label>Numero Polizza</label>
          <input
            type="text"
            placeholder="es. 74512938"
            value={data.policyNumber}
            onChange={(e) => handleChange('policyNumber', e.target.value)}
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Contraente</label>
            <input
              type="text"
              value={data.contractor}
              onChange={(e) => handleChange('contractor', e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>Assicurato</label>
            <input
              type="text"
              value={data.insured}
              onChange={(e) => handleChange('insured', e.target.value)}
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>P.IVA</label>
            <input
              type="text"
              value={data.vat}
              onChange={(e) => handleChange('vat', e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>Codice Fiscale</label>
            <input
              type="text"
              value={data.fiscalCode}
              onChange={(e) => handleChange('fiscalCode', e.target.value)}
            />
          </div>
        </div>

        <div className="form-group">
          <label>Altri Dati (Note)</label>
          <textarea
            rows="3"
            value={data.other}
            onChange={(e) => handleChange('other', e.target.value)}
          />
        </div>
      </div>

      <div className="form-actions">
        {isFormEmpty && (
          <div className="warning-msg">
            ⚠️ Nessun dato di mascheramento inserito. L'analisi verrà eseguita sul testo in chiaro.
          </div>
        )}
        <div className="btn-row">
          <Button onClick={onSubmit} style={{ width: '100%' }}>
            Avvia Analisi
          </Button>
        </div>
      </div>
    </div>
  );
};

export default MaskingForm;