import Link from 'next/link';

const linkStyle = {
  marginRight: 15
};

const Header2 = () => (
  <div>
    <Link href="/">
      <a style={linkStyle}>Home</a>
    </Link>
    <Link href="/ContactUs">
      <a style={linkStyle}>ContactUs</a>
    </Link>
  </div>
);

export default Header2;