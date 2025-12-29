import React, { useState } from 'react';
import Button from '../Common/Button';
import './Masking.css';

const MaskingForm = ({ data, onChange, options, onOptionsChange, onSubmit }) => {
  const [privacyAccepted, setPrivacyAccepted] = useState(false);

  const handleChange = (field, value) => {
    onChange({ ...data, [field]: value });
  };

  const handleOptionChange = (field, value) => {
    onOptionsChange({ ...options, [field]: value });
  };

  const isFormEmpty = !Object.values(data).some(val => val.length > 0);

  const getPolicyTypeLabel = () => {
    const labels = {
      'rc_generale': 'RC Generale',
      'incendio': 'Incendio',
      'trasporti': 'Trasporti',
      'cyber': 'Cyber Risk',
      'infortuni': 'Infortuni',
      'rca': 'RCA Auto'
    };
    return labels[options.policyType] || options.policyType;
  };

  const getAnalysisLevelLabel = () => {
    const labels = {
      'cliente': 'Cliente',
      'compagnia': 'Compagnia'
    };
    return labels[options.analysisLevel] || options.analysisLevel;
  };

  const handleSubmitClick = () => {
    const confirmMessage = `Confermi di voler avviare l'analisi con le seguenti impostazioni?\n\n` +
      `• Tipo Polizza: ${getPolicyTypeLabel()}\n` +
      `• Livello Analisi: ${getAnalysisLevelLabel()}\n\n` +
      `${isFormEmpty ? '⚠️ ATTENZIONE: Nessun dato di mascheramento inserito. L\'analisi verrà eseguita sul testo in chiaro.\n\n' : ''}` +
      `Premi OK per continuare.`;

    if (window.confirm(confirmMessage)) {
      onSubmit();
    }
  };

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
              <option value="cyber">Cyber Risk</option>
              <option value="infortuni">Infortuni</option>
              <option value="rca">RCA Auto</option>
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

        <div className="privacy-disclaimer">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={privacyAccepted}
              onChange={(e) => setPrivacyAccepted(e.target.checked)}
            />
            <span>
              Dichiaro di aver inserito correttamente i dati da mascherare e di essere consapevole che i documenti
              verranno elaborati tramite servizi di intelligenza artificiale. Mi assumo la responsabilità
              della corretta anonimizzazione dei dati sensibili.
            </span>
          </label>
        </div>

        <div className="btn-row">
          <Button
            onClick={handleSubmitClick}
            style={{ width: '100%' }}
            disabled={!privacyAccepted}
          >
            Avvia Analisi
          </Button>
        </div>
      </div>
    </div>
  );
};

export default MaskingForm;