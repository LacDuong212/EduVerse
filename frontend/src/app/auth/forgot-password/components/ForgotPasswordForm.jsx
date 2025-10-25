import IconTextFormInput from '@/components/form/IconTextFormInput';
import { yupResolver } from '@hookform/resolvers/yup';
import { useForm } from 'react-hook-form';
import { BsEnvelopeFill } from 'react-icons/bs';
import * as yup from 'yup';
import useForgotPassword from '../useForgotPassword';

const ForgotPasswordForm = ({ onForgotSuccess }) => {
  const editEmailFormSchema = yup.object({
    email: yup.string().email('Please enter valid email').required('Please enter your Email')
  });

  const { control, handleSubmit } = useForm({
    resolver: yupResolver(editEmailFormSchema),
    defaultValues: { email: '' }
  });

  const { loading, forgotPassword } = useForgotPassword(onForgotSuccess);

  const onSubmit = (data) => {
    forgotPassword(data.email);
  };

  return <form onSubmit={handleSubmit(onSubmit)}>
      <div className="mb-4">
        <IconTextFormInput control={control} icon={BsEnvelopeFill} placeholder="E-mail" label="Email address *" name="email" />
      </div>
      <div className="align-items-center">
        <div className="d-grid">
          <button className="btn btn-primary mb-0" type="submit" disabled={loading}>
            {loading ? 'Sending...' : 'Reset password'}
          </button>
        </div>
      </div>
    </form>;
};

export default ForgotPasswordForm;
