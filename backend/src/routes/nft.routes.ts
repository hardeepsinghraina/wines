import { Router } from 'express';
import { nftController } from '../controllers/nft.controller';
import { validateRequest } from '../middleware/joi-validation';
import { nftValidation } from '../validation/nft.validation';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// Public routes
router.get('/collections', nftController.getCollections);
router.get('/collections/:id', nftController.getCollectionById);
router.get('/wines', validateRequest(nftValidation.getWineNFTs), nftController.getWineNFTs);
router.get('/wines/:id', nftController.getNFTById);
router.get('/verify/:tokenId/:ownerAddress', nftController.verifyNFTOwnership);
router.get('/transactions/:transactionId', nftController.getTransactionStatus);

// Protected routes
router.post('/purchase', 
  authenticateToken, 
  validateRequest(nftValidation.purchaseNFT), 
  nftController.purchaseNFT
);

router.post('/mint', 
  authenticateToken, 
  validateRequest(nftValidation.mintNFT), 
  nftController.purchaseNFT
);

export default router;