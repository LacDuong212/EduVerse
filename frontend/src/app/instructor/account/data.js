import { FaFacebook, FaLinkedinIn } from 'react-icons/fa';
import { FcGoogle } from 'react-icons/fc';


export const linkedAccount = [{
  name: 'Google',
  description: 'You have successfully connected to your Google account',
  icon: FcGoogle,
  isActive: true,
  variant: 'text-google-icon'
}, {
  name: 'Linkedin',
  description: 'Connect to your Linkedin account',
  icon: FaLinkedinIn,
  isActive: false,
  variant: 'text-linkedin'
}, {
  name: 'Facebook',
  description: 'Connect to your Facebook account',
  icon: FaFacebook,
  isActive: false,
  variant: 'text-facebook'
}];
