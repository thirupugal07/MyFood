import { Link } from 'react-router-dom';
import Button from '../components/ui/Button';
import { useDocumentTitle } from '../hooks/useDocumentTitle';

const NotFound = () => {
  useDocumentTitle('Page not found');

  return (
    <div className="notfound">
      <p className="notfound__code">404</p>
      <h1>This page went off the menu</h1>
      <p className="notfound__text">
        The link you followed does not exist. The food, however, still does.
      </p>
      <div className="notfound__actions">
        <Button as={Link} to="/">
          Back to home
        </Button>
        <Button as={Link} to="/restaurants" variant="outline">
          Browse restaurants
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
