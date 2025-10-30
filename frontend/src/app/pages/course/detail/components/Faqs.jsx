import { Accordion, AccordionBody, AccordionHeader, AccordionItem } from 'react-bootstrap';
import { faqs } from '../data';
const Faqs = () => {
  return <>
      <h5 className="mb-3">Frequently Asked Questions</h5>
      <Accordion defaultActiveKey="0" flush id="accordionExample">
        {faqs.map((faq, idx) => <AccordionItem eventKey={`${idx}`} key={idx}>
            <AccordionHeader id="headingOne">
              <span className="text-secondary fw-bold me-3">0{idx + 1}</span>
              <span className="h6 mb-0">{faq.question}</span>
            </AccordionHeader>
            <AccordionBody className="pt-0">{faq.answer}</AccordionBody>
          </AccordionItem>)}
      </Accordion>
    </>;
};
export default Faqs;
