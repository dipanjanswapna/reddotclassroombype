
'use client';

import React, { useState } from 'react';
import { Button } from './ui/button';
import { cn } from '@/lib/utils';
import mexp from 'math-expression-evaluator';

const CalculatorButton = ({
  children,
  onClick,
  className,
  variant = 'secondary',
  gridClassName = '',
  mainTextClassName = '',
  secondaryText = '',
  secondaryTextClassName = '',
}: {
  children: React.ReactNode;
  onClick: () => void;
  className?: string;
  variant?: 'secondary' | 'default' | 'destructive' | 'outline' | 'ghost' | 'link';
  gridClassName?: string;
  mainTextClassName?: string;
  secondaryText?: string;
  secondaryTextClassName?: string;
}) => (
  <div className={cn('relative', gridClassName)}>
    <Button
      variant={variant as any}
      onClick={onClick}
      className={cn('h-12 w-full text-xl font-bold text-gray-800 shadow-md active:shadow-inner', className)}
    >
      <span className={cn(mainTextClassName)}>{children}</span>
    </Button>
    {secondaryText && (
      <span
        className={cn(
          'absolute top-1 left-2 text-[10px] font-semibold pointer-events-none',
          secondaryTextClassName
        )}
      >
        {secondaryText}
      </span>
    )}
  </div>
);

export function CasioCalculator() {
  const [display, setDisplay] = useState('0');
  const [expression, setExpression] = useState('');

  const handleInput = (value: string) => {
    if (display === '0' && value !== '.') {
      setDisplay(value);
    } else if (display === 'Error') {
       setDisplay(value);
    }
    else {
      setDisplay(display + value);
    }
  };

  const handleOperator = (operator: string) => {
    if (display === 'Error' || display === '') return;
    setExpression(prev => prev + display + ` ${operator} `);
    setDisplay('0');
  };

  const handleEquals = () => {
    if (expression === '' && display === '0') return;
    const finalExpression = (expression + display).replace(/√/g, 'sqrt');
    try {
        const result = mexp.eval(finalExpression);
        setDisplay(result.toString());
        setExpression('');
    } catch (e) {
        setDisplay('Error');
        setExpression('');
    }
  };
  
  const handleFunction = (func: string) => {
    if (display === 'Error' || isNaN(parseFloat(display))) return;

    const currentVal = parseFloat(display);
    let result;
    switch(func) {
        case 'sqrt':
            result = Math.sqrt(currentVal);
            break;
        case 'x^2':
            result = Math.pow(currentVal, 2);
            break;
        case 'x^-1':
            result = 1 / currentVal;
            break;
        case 'sin':
            result = Math.sin(currentVal * Math.PI / 180); // Assuming degree mode
            break;
        case 'cos':
            result = Math.cos(currentVal * Math.PI / 180);
            break;
        case 'tan':
            result = Math.tan(currentVal * Math.PI / 180);
            break;
        case 'log':
            result = Math.log10(currentVal);
            break;
        case 'ln':
            result = Math.log(currentVal);
            break;
        default:
            return;
    }
     setDisplay(result.toString());
  }

  const handleClear = () => {
    setDisplay('0');
    setExpression('');
  };

  const handleDelete = () => {
    if (display.length > 1) {
      setDisplay(display.slice(0, -1));
    } else {
      setDisplay('0');
    }
  };

  return (
    <div className="w-full max-w-[340px] p-4 bg-[#2d3748] rounded-2xl shadow-2xl border-2 border-gray-600 font-sans">
      {/* Header */}
      <div className="flex justify-between items-center text-white px-2 mb-2">
        <span className="font-bold text-lg">CASIO</span>
        <div className="text-right">
          <p className="text-xs">fx-991EX</p>
          <p className="text-xs font-bold text-pink-400">CLASSWIZ</p>
        </div>
      </div>
      <div className="h-4 bg-[#1a202c] rounded-t-md mb-1"></div>

      {/* Screen */}
      <div className="bg-gray-200 p-2 rounded-md h-24 flex flex-col justify-end mb-4 border-4 border-gray-500">
        <div className="text-right text-sm text-gray-600 h-6 overflow-hidden truncate">{expression}</div>
        <div className="text-right text-4xl font-mono text-black font-bold h-12 truncate">{display}</div>
      </div>

      {/* Buttons */}
      <div className="grid grid-cols-6 gap-2">
        <CalculatorButton gridClassName='col-span-2' className="bg-gray-600 text-white" onClick={() => {}} secondaryText='SHIFT' secondaryTextClassName='text-yellow-300'> </CalculatorButton>
        <CalculatorButton gridClassName='col-span-2' className="bg-gray-600 text-white" onClick={() => {}} secondaryText='ALPHA' secondaryTextClassName='text-pink-400'> </CalculatorButton>
        <CalculatorButton className="bg-gray-600 text-white" onClick={() => {}} secondaryText='MENU' secondaryTextClassName='text-white'> </CalculatorButton>
        <CalculatorButton className="bg-gray-600 text-white" onClick={() => {}} secondaryText='ON' secondaryTextClassName='text-white'> </CalculatorButton>
        
        {/* Function buttons */}
        <CalculatorButton className='col-span-6 h-4' variant='ghost' onClick={()=>{}}></CalculatorButton>

        <CalculatorButton onClick={() => handleInput('(')} secondaryText='QR' secondaryTextClassName='text-yellow-300' className='bg-gray-400'>(</CalculatorButton>
        <CalculatorButton onClick={() => handleInput(')')} secondaryText='SOLVE' secondaryTextClassName='text-yellow-300' className='bg-gray-400'>)</CalculatorButton>
        <CalculatorButton onClick={() => handleFunction('sqrt')} secondaryText='CALC' secondaryTextClassName='text-pink-400' className='bg-gray-400'>√</CalculatorButton>
        <CalculatorButton onClick={() => handleFunction('x^2')} className='bg-gray-400'>x²</CalculatorButton>
        <CalculatorButton onClick={() => handleFunction('log')} className='bg-gray-400'>log</CalculatorButton>
        <CalculatorButton onClick={() => handleFunction('ln')} className='bg-gray-400'>ln</CalculatorButton>
        
        <CalculatorButton onClick={() => handleInput('-')} className='bg-gray-400' mainTextClassName='font-mono'>(-)</CalculatorButton>
        <CalculatorButton onClick={() => {}} className='bg-gray-400'>° ′ ″</CalculatorButton>
        <CalculatorButton onClick={() => handleFunction('x^-1')} className='bg-gray-400'>x⁻¹</CalculatorButton>
        <CalculatorButton onClick={() => handleFunction('sin')} className='bg-gray-400'>sin</CalculatorButton>
        <CalculatorButton onClick={() => handleFunction('cos')} className='bg-gray-400'>cos</CalculatorButton>
        <CalculatorButton onClick={() => handleFunction('tan')} className='bg-gray-400'>tan</CalculatorButton>

        <CalculatorButton onClick={() => {}} className='bg-gray-400'>STO</CalculatorButton>
        <CalculatorButton onClick={() => {}} className='bg-gray-400'>ENG</CalculatorButton>
        <CalculatorButton onClick={() => {}} className='bg-gray-400'>M</CalculatorButton>

        {/* Number pad */}
        <div className="col-span-3 grid grid-cols-3 gap-2">
            <CalculatorButton onClick={() => handleInput('7')}>7</CalculatorButton>
            <CalculatorButton onClick={() => handleInput('8')}>8</CalculatorButton>
            <CalculatorButton onClick={() => handleInput('9')}>9</CalculatorButton>
            <CalculatorButton onClick={() => handleInput('4')}>4</CalculatorButton>
            <CalculatorButton onClick={() => handleInput('5')}>5</CalculatorButton>
            <CalculatorButton onClick={() => handleInput('6')}>6</CalculatorButton>
            <CalculatorButton onClick={() => handleInput('1')}>1</CalculatorButton>
            <CalculatorButton onClick={() => handleInput('2')}>2</CalculatorButton>
            <CalculatorButton onClick={() => handleInput('3')}>3</CalculatorButton>
            <CalculatorButton onClick={() => handleInput('0')}>0</CalculatorButton>
            <CalculatorButton onClick={() => handleInput('.')}>.</CalculatorButton>
            <CalculatorButton onClick={() => {}} className='bg-gray-400'>Ans</CalculatorButton>
        </div>
        
        <div className="col-span-3 grid grid-cols-2 gap-2">
            <CalculatorButton onClick={handleDelete} className='bg-blue-600 text-white'>DEL</CalculatorButton>
            <CalculatorButton onClick={handleClear} className='bg-orange-500 text-white'>AC</CalculatorButton>
            <CalculatorButton onClick={() => handleOperator('*')} className='bg-gray-400'>×</CalculatorButton>
            <CalculatorButton onClick={() => handleOperator('/')} className='bg-gray-400'>÷</CalculatorButton>
            <CalculatorButton onClick={() => handleOperator('+')} className='bg-gray-400'>+</CalculatorButton>
            <CalculatorButton onClick={() => handleOperator('-')} className='bg-gray-400'>-</CalculatorButton>
            <CalculatorButton gridClassName='col-span-2' onClick={handleEquals} className='bg-gray-400'>=</CalculatorButton>
        </div>

      </div>
    </div>
  );
}
