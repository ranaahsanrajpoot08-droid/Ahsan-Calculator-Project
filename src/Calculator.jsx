import { useState, useCallback } from "react";
import "./Calculator.css";

const buttons = [
  { label: "AC", type: "function", wide: false },
  { label: "+/-", type: "function" },
  { label: "%", type: "function" },
  { label: "÷", type: "operator" },
  { label: "7", type: "number" },
  { label: "8", type: "number" },
  { label: "9", type: "number" },
  { label: "×", type: "operator" },
  { label: "4", type: "number" },
  { label: "5", type: "number" },
  { label: "6", type: "number" },
  { label: "−", type: "operator" },
  { label: "1", type: "number" },
  { label: "2", type: "number" },
  { label: "3", type: "number" },
  { label: "+", type: "operator" },
  { label: "0", type: "number", wide: true },
  { label: ".", type: "number" },
  { label: "=", type: "operator" },
];

export default function Calculator() {
  const [display, setDisplay] = useState("0");
  const [expression, setExpression] = useState("");
  const [prevValue, setPrevValue] = useState(null);
  const [operator, setOperator] = useState(null);
  const [waitingForOperand, setWaitingForOperand] = useState(false);
  const [justEvaluated, setJustEvaluated] = useState(false);
  const [activeOp, setActiveOp] = useState(null);

  const calculate = useCallback((a, op, b) => {
    switch (op) {
      case "+": return a + b;
      case "−": return a - b;
      case "×": return a * b;
      case "÷": return b !== 0 ? a / b : "Error";
      default: return b;
    }
  }, []);

  const formatDisplay = (val) => {
    if (val === "Error") return "Error";
    const num = parseFloat(val);
    if (isNaN(num)) return "0";
    // Handle large/small numbers
    if (Math.abs(num) >= 1e10 || (Math.abs(num) < 1e-6 && num !== 0)) {
      return num.toExponential(4);
    }
    // Trim unnecessary decimals
    const str = num.toString();
    return str.length > 10 ? parseFloat(num.toPrecision(9)).toString() : str;
  };

  const getFontSize = (text) => {
    if (text.length > 9) return "2.4rem";
    if (text.length > 7) return "3rem";
    return "3.8rem";
  };

  const handleButton = useCallback((label, type) => {
    if (type === "number") {
      if (label === ".") {
        if (waitingForOperand) {
          setDisplay("0.");
          setWaitingForOperand(false);
          setJustEvaluated(false);
          return;
        }
        if (display.includes(".")) return;
        setDisplay(display + ".");
        setJustEvaluated(false);
        return;
      }

      if (waitingForOperand || justEvaluated) {
        setDisplay(label);
        setWaitingForOperand(false);
        setJustEvaluated(false);
      } else {
        setDisplay(display === "0" ? label : display + label);
      }
    }

    if (type === "function") {
      if (label === "AC") {
        setDisplay("0");
        setExpression("");
        setPrevValue(null);
        setOperator(null);
        setWaitingForOperand(false);
        setJustEvaluated(false);
        setActiveOp(null);
        return;
      }
      if (label === "+/-") {
        const num = parseFloat(display) * -1;
        setDisplay(formatDisplay(num.toString()));
        return;
      }
      if (label === "%") {
        const num = parseFloat(display) / 100;
        setDisplay(formatDisplay(num.toString()));
        return;
      }
    }

    if (type === "operator") {
      if (label === "=") {
        if (operator && prevValue !== null) {
          const current = parseFloat(display);
          const result = calculate(prevValue, operator, current);
          const formatted = formatDisplay(result.toString());
          setDisplay(formatted);
          setExpression("");
          setPrevValue(null);
          setOperator(null);
          setWaitingForOperand(false);
          setJustEvaluated(true);
          setActiveOp(null);
        }
        return;
      }

      const current = parseFloat(display);

      if (prevValue !== null && !waitingForOperand) {
        const result = calculate(prevValue, operator, current);
        const formatted = formatDisplay(result.toString());
        setDisplay(formatted);
        setPrevValue(parseFloat(formatted));
      } else {
        setPrevValue(current);
      }

      setOperator(label);
      setActiveOp(label);
      setWaitingForOperand(true);
      setJustEvaluated(false);
      setExpression(`${display} ${label}`);
    }
  }, [display, prevValue, operator, waitingForOperand, justEvaluated, calculate]);

  return (
    <div className="calculator-wrapper">
      <div className="calculator">
        <div className="display">
          <div className="expression">{expression}</div>
          <div className="number" style={{ fontSize: getFontSize(display) }}>
            {display}
          </div>
        </div>
        <div className="buttons">
          {buttons.map((btn, i) => (
            <button
              key={i}
              className={[
                "btn",
                `btn--${btn.type}`,
                btn.wide ? "btn--wide" : "",
                activeOp === btn.label && btn.type === "operator" && btn.label !== "=" ? "btn--active-op" : "",
              ].join(" ")}
              onClick={() => handleButton(btn.label, btn.type)}
            >
              {btn.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
