import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, CheckCircle } from 'lucide-react';
import { clientService, ClientData } from '../../services/clientService';
import styles from './CadastrarClientePage.module.css';

// ── Validação de CPF (dígitos verificadores) ──
function isValidCPF(cpf: string): boolean {
  const digits = cpf.replace(/\D/g, '');
  if (digits.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(digits)) return false;

  let sum = 0;
  for (let i = 0; i < 9; i++) sum += parseInt(digits[i]) * (10 - i);
  let rest = (sum * 10) % 11;
  if (rest === 10) rest = 0;
  if (rest !== parseInt(digits[9])) return false;

  sum = 0;
  for (let i = 0; i < 10; i++) sum += parseInt(digits[i]) * (11 - i);
  rest = (sum * 10) % 11;
  if (rest === 10) rest = 0;
  if (rest !== parseInt(digits[10])) return false;

  return true;
}

// ── Validação de CNPJ (dígitos verificadores) ──
function isValidCNPJ(cnpj: string): boolean {
  const digits = cnpj.replace(/\D/g, '');
  if (digits.length !== 14) return false;
  if (/^(\d)\1{13}$/.test(digits)) return false;

  const weights1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  const weights2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];

  let sum = 0;
  for (let i = 0; i < 12; i++) sum += parseInt(digits[i]) * weights1[i];
  let rest = sum % 11;
  const d1 = rest < 2 ? 0 : 11 - rest;
  if (parseInt(digits[12]) !== d1) return false;

  sum = 0;
  for (let i = 0; i < 13; i++) sum += parseInt(digits[i]) * weights2[i];
  rest = sum % 11;
  const d2 = rest < 2 ? 0 : 11 - rest;
  if (parseInt(digits[13]) !== d2) return false;

  return true;
}

// ── Máscaras ──
function maskCPF(value: string): string {
  const d = value.replace(/\D/g, '').slice(0, 11);
  return d
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
}

function maskCNPJ(value: string): string {
  const d = value.replace(/\D/g, '').slice(0, 14);
  return d
    .replace(/(\d{2})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1/$2')
    .replace(/(\d{4})(\d{1,2})$/, '$1-$2');
}

function maskPhone(value: string): string {
  const d = value.replace(/\D/g, '').slice(0, 11);
  if (d.length <= 10) {
    return d
      .replace(/(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{4})(\d)/, '$1-$2');
  }
  return d
    .replace(/(\d{2})(\d)/, '($1) $2')
    .replace(/(\d{5})(\d)/, '$1-$2');
}

const TABS = ['Dados gerais', 'Endereço', 'Observações'];

interface CadastrarClientePageProps {
  onSave?: (client: any) => void;
  cancelPath?: string;
}

const CadastrarClientePage: React.FC<CadastrarClientePageProps> = ({ onSave, cancelPath }) => {
  const navigate = useNavigate();
  const { id: clientId } = useParams<{ id: string }>();
  const isEditing = Boolean(clientId);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [activeTab] = useState(0);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [redirecting, setRedirecting] = useState(false);

  // Form fields
  const [personType, setPersonType] = useState<'fisica' | 'juridica'>('fisica');
  const [cpfCnpj, setCpfCnpj] = useState('');
  const [name, setName] = useState('');
  const [gender, setGender] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [instagram, setInstagram] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [photo, setPhoto] = useState<string | null>(null);

  // Validation errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Carregar dados do cliente no modo edição
  useEffect(() => {
    if (!clientId) return;
    const loadClient = async () => {
      setLoading(true);
      try {
        const c = await clientService.getClient(Number(clientId));
        setName(c.name || '');
        setPersonType(c.personType === 'juridica' ? 'juridica' : 'fisica');
        setCpfCnpj(
          c.cpfCnpj
            ? c.personType === 'juridica'
              ? maskCNPJ(c.cpfCnpj)
              : maskCPF(c.cpfCnpj)
            : ''
        );
        setGender(c.gender || '');
        setBirthDate(c.birthDate || '');
        setWhatsapp(c.whatsapp ? maskPhone(c.whatsapp) : '');
        setInstagram(c.instagram || '');
        setEmail(c.email || '');
        setPhone(c.phone ? maskPhone(c.phone) : '');
        setPhoto(c.photo || null);
      } catch (err) {
        console.error('Erro ao carregar cliente:', err);
        setErrorMsg('Erro ao carregar dados do cliente.');
      } finally {
        setLoading(false);
      }
    };
    loadClient();
  }, [clientId]);

  const handlePhotoClick = () => {
    fileInputRef.current?.click();
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMsg('Selecione um arquivo de imagem válido.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrorMsg('A imagem deve ter no máximo 5MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setPhoto(reader.result as string);
      setErrorMsg('');
    };
    reader.readAsDataURL(file);
  };

  const removePhoto = () => {
    setPhoto(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!name.trim()) {
      newErrors.name = 'Nome é obrigatório';
    }

    if (cpfCnpj.trim()) {
      if (personType === 'fisica') {
        if (!isValidCPF(cpfCnpj)) {
          newErrors.cpfCnpj = 'CPF inválido (dígito verificador incorreto)';
        }
      } else {
        if (!isValidCNPJ(cpfCnpj)) {
          newErrors.cpfCnpj = 'CNPJ inválido (dígito verificador incorreto)';
        }
      }
    }

    if (email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'E-mail inválido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;

    setSaving(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const data: ClientData = {
        name: name.trim(),
        personType,
        cpfCnpj: cpfCnpj.replace(/\D/g, '') || undefined,
        gender: gender || undefined,
        birthDate: birthDate || undefined,
        phone: phone.replace(/\D/g, '') || undefined,
        whatsapp: whatsapp.replace(/\D/g, '') || undefined,
        instagram: instagram.trim() || undefined,
        email: email.trim() || undefined,
        photo: photo || undefined,
      };

      if (isEditing) {
        await clientService.updateClient(Number(clientId), data);
      } else {
        const created = await clientService.createClient(data);
        if (onSave) {
          onSave(created);
          return;
        }
      }

      setSuccessMsg(isEditing ? 'Cliente atualizado com sucesso!' : 'Cliente cadastrado com sucesso!');
      setRedirecting(true);
      setTimeout(() => navigate('/vendas-e-clientes/lista-clientes'), 1800);
    } catch (err: any) {
      const msg =
        err?.response?.data?.errors?.[0]?.msg ||
        err?.response?.data?.error ||
        'Erro ao salvar cliente.';
      setErrorMsg(msg);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    navigate(cancelPath || '/vendas-e-clientes');
  };

  const handleCpfCnpjChange = (value: string) => {
    if (personType === 'fisica') {
      setCpfCnpj(maskCPF(value));
    } else {
      setCpfCnpj(maskCNPJ(value));
    }
  };

  const handlePersonTypeChange = (type: 'fisica' | 'juridica') => {
    setPersonType(type);
    setCpfCnpj('');
    setErrors((prev) => {
      const next = { ...prev };
      delete next.cpfCnpj;
      return next;
    });
  };

  return (
    <div className={styles.container}>
      {/* Overlay de sucesso animado */}
      <AnimatePresence>
        {redirecting && (
          <motion.div
            className={styles.successOverlay}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
          >
            <motion.div
              className={styles.successCard}
              initial={{ scale: 0.5, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 22, delay: 0.1 }}
            >
              <motion.div
                className={styles.successIconWrap}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 400, damping: 15, delay: 0.3 }}
              >
                <CheckCircle size={48} />
              </motion.div>
              <motion.h2
                className={styles.successTitle}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.3 }}
              >
                {successMsg}
              </motion.h2>
              <motion.p
                className={styles.successSubtitle}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7, duration: 0.3 }}
              >
                Redirecionando para a lista de clientes…
              </motion.p>
              <motion.div
                className={styles.successBar}
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 1.4, delay: 0.3, ease: 'easeInOut' }}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <h1 className={styles.title}>{isEditing ? 'Editar Cliente' : 'Cadastrar Cliente'}</h1>

      {/* Tabs */}
      <div className={styles.tabs}>
        {TABS.map((tab, idx) => (
          <button
            key={tab}
            className={`${styles.tab} ${idx === activeTab ? styles.active : styles.disabled}`}
            disabled={idx !== activeTab}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Feedback */}
      {errorMsg && <div className={styles.errorMsg}>{errorMsg}</div>}

      {/* Content */}
      <div className={styles.content}>
        {/* Photo upload */}
        <div className={styles.photoSection}>
          <div className={styles.photoPreview} onClick={handlePhotoClick}>
            {photo ? (
              <img src={photo} alt="Foto do cliente" />
            ) : (
              <div className={styles.photoPlaceholder}>
                <Camera size={36} />
                <span>Adicionar foto</span>
              </div>
            )}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handlePhotoChange}
            style={{ display: 'none' }}
          />
          <div className={styles.photoActions}>
            <button className={styles.btnUpload} onClick={handlePhotoClick} type="button">
              Enviar
            </button>
            {photo && (
              <button className={styles.btnRemovePhoto} onClick={removePhoto} type="button">
                Remover
              </button>
            )}
          </div>
        </div>

        {/* Form fields */}
        <div className={styles.formGrid}>
          {/* Tipo de pessoa */}
          <div className={styles.fieldGroup}>
            <label>Tipo de pessoa</label>
            <select value={personType} onChange={(e) => handlePersonTypeChange(e.target.value as 'fisica' | 'juridica')}>
              <option value="fisica">Pessoa Física</option>
              <option value="juridica">Pessoa Jurídica</option>
            </select>
          </div>

          {/* CPF / CNPJ */}
          <div className={styles.fieldGroup}>
            <label>{personType === 'fisica' ? 'CPF' : 'CNPJ'}</label>
            <input
              type="text"
              placeholder={personType === 'fisica' ? '000.000.000-00' : '00.000.000/0000-00'}
              value={cpfCnpj}
              onChange={(e) => handleCpfCnpjChange(e.target.value)}
              className={errors.cpfCnpj ? styles.error : ''}
            />
            {errors.cpfCnpj && <span className={styles.errorText}>{errors.cpfCnpj}</span>}
          </div>

          {/* Nome */}
          <div className={styles.fieldGroup}>
            <label>Nome *</label>
            <input
              type="text"
              placeholder="Nome completo"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={errors.name ? styles.error : ''}
            />
            {errors.name && <span className={styles.errorText}>{errors.name}</span>}
          </div>

          {/* Gênero */}
          <div className={styles.fieldGroup}>
            <label>Gênero</label>
            <select value={gender} onChange={(e) => setGender(e.target.value)}>
              <option value="">Selecione</option>
              <option value="Masculino">Masculino</option>
              <option value="Feminino">Feminino</option>
              <option value="Outro">Outro</option>
              <option value="Prefiro não informar">Prefiro não informar</option>
            </select>
          </div>

          {/* Data de nascimento */}
          <div className={styles.fieldGroup}>
            <label>Data de nascimento</label>
            <input
              type="date"
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
            />
          </div>

          {/* Whatsapp */}
          <div className={styles.fieldGroup}>
            <label>Whatsapp</label>
            <input
              type="text"
              placeholder="(00) 00000-0000"
              value={whatsapp}
              onChange={(e) => setWhatsapp(maskPhone(e.target.value))}
            />
          </div>

          {/* Instagram */}
          <div className={styles.fieldGroup}>
            <label>Instagram</label>
            <input
              type="text"
              placeholder="@usuario"
              value={instagram}
              onChange={(e) => setInstagram(e.target.value)}
            />
          </div>

          {/* E-mail */}
          <div className={styles.fieldGroup}>
            <label>E-mail</label>
            <input
              type="email"
              placeholder="email@exemplo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={errors.email ? styles.error : ''}
            />
            {errors.email && <span className={styles.errorText}>{errors.email}</span>}
          </div>

          {/* Telefone */}
          <div className={styles.fieldGroup}>
            <label>Telefone</label>
            <input
              type="text"
              placeholder="(00) 0000-0000"
              value={phone}
              onChange={(e) => setPhone(maskPhone(e.target.value))}
            />
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className={styles.footer}>
        <button className={styles.btnCancel} onClick={handleCancel} type="button">
          Cancelar
        </button>
        <button className={styles.btnSave} onClick={handleSave} disabled={saving || loading} type="button">
          {saving ? 'Salvando...' : isEditing ? 'Atualizar Cliente' : 'Salvar'}
        </button>
      </div>
    </div>
  );
};

export default CadastrarClientePage;
