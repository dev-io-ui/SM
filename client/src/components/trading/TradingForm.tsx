import React from 'react';
import {
  VStack,
  FormControl,
  FormLabel,
  Input,
  Select,
  Button,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  FormErrorMessage,
  Collapse,
  Box,
} from '@chakra-ui/react';
import { useFormik } from 'formik';
import * as Yup from 'yup';

interface TradingFormProps {
  onSubmit: (values: any) => void;
  isLoading: boolean;
}

const TradingForm: React.FC<TradingFormProps> = ({ onSubmit, isLoading }) => {
  const formik = useFormik({
    initialValues: {
      type: 'buy',
      symbol: '',
      quantity: 1,
      price: 0,
      orderType: 'market',
      limitPrice: 0,
      stopLoss: 0,
      takeProfit: 0,
    },
    validationSchema: Yup.object({
      type: Yup.string().required('Required'),
      symbol: Yup.string().required('Required'),
      quantity: Yup.number()
        .min(1, 'Must be at least 1')
        .required('Required'),
      price: Yup.number()
        .min(0, 'Must be positive')
        .required('Required'),
      orderType: Yup.string().required('Required'),
      limitPrice: Yup.number().min(0, 'Must be positive'),
      stopLoss: Yup.number().min(0, 'Must be positive'),
      takeProfit: Yup.number().min(0, 'Must be positive'),
    }),
    onSubmit: (values) => {
      onSubmit(values);
    },
  });

  return (
    <form onSubmit={formik.handleSubmit}>
      <VStack spacing={4}>
        <FormControl isInvalid={!!formik.errors.type && formik.touched.type}>
          <FormLabel>Trade Type</FormLabel>
          <Select
            name="type"
            value={formik.values.type}
            onChange={formik.handleChange}
          >
            <option value="buy">Buy</option>
            <option value="sell">Sell</option>
          </Select>
          <FormErrorMessage>{formik.errors.type}</FormErrorMessage>
        </FormControl>

        <FormControl isInvalid={!!formik.errors.symbol && formik.touched.symbol}>
          <FormLabel>Stock Symbol</FormLabel>
          <Input
            name="symbol"
            placeholder="e.g., AAPL"
            value={formik.values.symbol}
            onChange={formik.handleChange}
          />
          <FormErrorMessage>{formik.errors.symbol}</FormErrorMessage>
        </FormControl>

        <FormControl isInvalid={!!formik.errors.quantity && formik.touched.quantity}>
          <FormLabel>Quantity</FormLabel>
          <NumberInput
            min={1}
            value={formik.values.quantity}
            onChange={(_, value) => formik.setFieldValue('quantity', value)}
          >
            <NumberInputField name="quantity" />
            <NumberInputStepper>
              <NumberIncrementStepper />
              <NumberDecrementStepper />
            </NumberInputStepper>
          </NumberInput>
          <FormErrorMessage>{formik.errors.quantity}</FormErrorMessage>
        </FormControl>

        <FormControl isInvalid={!!formik.errors.orderType && formik.touched.orderType}>
          <FormLabel>Order Type</FormLabel>
          <Select
            name="orderType"
            value={formik.values.orderType}
            onChange={formik.handleChange}
          >
            <option value="market">Market Order</option>
            <option value="limit">Limit Order</option>
          </Select>
          <FormErrorMessage>{formik.errors.orderType}</FormErrorMessage>
        </FormControl>

        <Collapse in={formik.values.orderType === 'limit'} animateOpacity>
          <Box w="100%">
            <FormControl isInvalid={!!formik.errors.limitPrice && formik.touched.limitPrice}>
              <FormLabel>Limit Price</FormLabel>
              <NumberInput
                min={0}
                value={formik.values.limitPrice}
                onChange={(_, value) => formik.setFieldValue('limitPrice', value)}
              >
                <NumberInputField name="limitPrice" />
                <NumberInputStepper>
                  <NumberIncrementStepper />
                  <NumberDecrementStepper />
                </NumberInputStepper>
              </NumberInput>
              <FormErrorMessage>{formik.errors.limitPrice}</FormErrorMessage>
            </FormControl>
          </Box>
        </Collapse>

        <FormControl isInvalid={!!formik.errors.stopLoss && formik.touched.stopLoss}>
          <FormLabel>Stop Loss (Optional)</FormLabel>
          <NumberInput
            min={0}
            value={formik.values.stopLoss}
            onChange={(_, value) => formik.setFieldValue('stopLoss', value)}
          >
            <NumberInputField name="stopLoss" />
            <NumberInputStepper>
              <NumberIncrementStepper />
              <NumberDecrementStepper />
            </NumberInputStepper>
          </NumberInput>
          <FormErrorMessage>{formik.errors.stopLoss}</FormErrorMessage>
        </FormControl>

        <FormControl isInvalid={!!formik.errors.takeProfit && formik.touched.takeProfit}>
          <FormLabel>Take Profit (Optional)</FormLabel>
          <NumberInput
            min={0}
            value={formik.values.takeProfit}
            onChange={(_, value) => formik.setFieldValue('takeProfit', value)}
          >
            <NumberInputField name="takeProfit" />
            <NumberInputStepper>
              <NumberIncrementStepper />
              <NumberDecrementStepper />
            </NumberInputStepper>
          </NumberInput>
          <FormErrorMessage>{formik.errors.takeProfit}</FormErrorMessage>
        </FormControl>

        <Button
          type="submit"
          colorScheme={formik.values.type === 'buy' ? 'green' : 'red'}
          width="full"
          isLoading={isLoading}
        >
          {formik.values.type === 'buy' ? 'Buy' : 'Sell'} Stock
        </Button>
      </VStack>
    </form>
  );
};

export default TradingForm;
