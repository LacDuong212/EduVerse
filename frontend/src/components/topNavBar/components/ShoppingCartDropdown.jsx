import book2 from '@/assets/images/book/02.jpg';
import book4 from '@/assets/images/book/04.jpg';
import ChoicesFormInput from '@/components/form/ChoicesFormInput';
import { Button, Card, CardBody, CardFooter, CardHeader, Col, Dropdown, DropdownMenu, DropdownToggle, Row } from 'react-bootstrap';
import { BsCart3, BsXLg } from 'react-icons/bs';
import { Link } from "react-router-dom";


const ShoppingCartDropdown = ({ className }) => {
  return <Dropdown drop="start" className={className}>
      <DropdownToggle className="btn btn-light btn-round mb-0 arrow-none" as={'a'} role="button" data-bs-toggle="dropdown" aria-expanded="false" data-bs-auto-close="outside">
        <BsCart3 className="bi bi-cart3 fa-fw" />
      </DropdownToggle>
      <span className="position-absolute top-0 start-100 translate-middle badge rounded-circle bg-dark mt-xl-2 ms-n1">
        2
      </span>
      <DropdownMenu className="dropdown-menu dropdown-animation dropdown-menu-end dropdown-menu-size-md p-0 shadow-lg border-0">
        <Card className="bg-transparent">
          <CardHeader className="bg-transparent border-bottom py-4">
            <h5 className="m-0">Cart items</h5>
          </CardHeader>
          <CardBody className="p-0">
            <Row className="p-3 g-2">
              <Col xs={3}>
                <img className="rounded-2" src={book2} alt="avatar" />
              </Col>
              <Col xs={9}>
                <div className="d-flex justify-content-between">
                  <h6 className="m-0">Angular 4 Tutorial in audio (Compact Disk)</h6>
                  <a href="#" className="small text-primary-hover">
                    <BsXLg />
                  </a>
                </div>
                <form className="choices-sm pt-2 col-4">
                  <ChoicesFormInput className="form-select js-choice border-0 bg-transparent" data-search-enabled="false">
                    <option>1</option>
                    <option selected>2</option>
                    <option>3</option>
                    <option>4</option>
                    <option>5</option>
                  </ChoicesFormInput>
                </form>
              </Col>
            </Row>
            <hr className="m-0" />
            <Row className="p-3 g-2">
              <Col xs={3}>
                <img className="rounded-2" src={book4} alt="avatar" />
              </Col>
              <Col xs={9}>
                <div className="d-flex justify-content-between">
                  <h6 className="m-0">The Principles of Beautiful Graphics Design (Paperback)</h6>
                  <a href="#" className="small text-primary-hover">
                    <BsXLg />
                  </a>
                </div>
                <form className="choices-sm pt-2 col-4">
                  <ChoicesFormInput className="form-select js-choice border-0 bg-transparent" data-search-enabled="false">
                    <option selected>1</option>
                    <option>2</option>
                    <option>3</option>
                    <option>4</option>
                    <option>5</option>
                  </ChoicesFormInput>
                </form>
              </Col>
            </Row>
          </CardBody>
          <CardFooter className="bg-transparent border-top py-3 text-center d-flex justify-content-between position-relative">
            <Button as={Link} to="/student/cart" variant="light" size="sm" className="mb-0">
              View Cart
            </Button>
            <Button variant="success" size="sm" className="mb-0">
              Checkout
            </Button>
          </CardFooter>
        </Card>
      </DropdownMenu>
    </Dropdown>;
};
export default ShoppingCartDropdown;
