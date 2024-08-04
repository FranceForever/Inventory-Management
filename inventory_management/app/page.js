'use client'
import React, { useState, useEffect, useRef, useCallback } from "react";
import { firestore, storage } from "@/firebase";
import { Box, Typography, Button, TextField, Stack, Dialog, DialogActions, DialogContent, DialogTitle } from "@mui/material";
import { collection, getDocs, query, addDoc, updateDoc, deleteDoc, doc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import Webcam from "react-webcam";

export default function Home() {
  const [inventory, setInventory] = useState([]);
  const [itemName, setItemName] = useState('');
  const [itemCount, setItemCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [captureImage, setCaptureImage] = useState(false);
  const [image, setImage] = useState(null);
  const [viewImageUrl, setViewImageUrl] = useState('');
  const [recipe, setRecipe] = useState('');

  const updateInventory = async () => {
    const inventoryCollection = collection(firestore, "inventory");
    const snapshot = query(inventoryCollection);
    const docs = await getDocs(snapshot);
    const inventoryList = [];

    docs.forEach((doc) => {
      inventoryList.push({
        id: doc.id,
        ...doc.data(),
      });
    });
    setInventory(inventoryList);
  };

  const classifyImage = async (imageUrl) => {
    try {
      const response = await fetch('/api/classify-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ imageUrl }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to classify image');
      }

      const data = await response.json();
      return data.labels.join(', ');
    } catch (error) {
      console.error('Error in classifyImage:', error);
      throw error;
    }
  };

  const addItem = async () => {
    if (itemName && itemCount > 0) {
      let imageUrl = image;
      let labels = '';

      if (image) {
        labels = await classifyImage(image);
      }

      const existingItem = inventory.find(
        (item) => item.name && item.name.toLowerCase() === itemName.toLowerCase()
      );

      if (existingItem) {
        const itemDoc = doc(firestore, "inventory", existingItem.id);
        await updateDoc(itemDoc, {
          count: existingItem.count + itemCount,
          imageUrl: imageUrl,
          labels: labels
        });
      } else {
        await addDoc(collection(firestore, "inventory"), {
          name: itemName,
          count: itemCount,
          imageUrl: imageUrl,
          labels: labels
        });
      }
      updateInventory();
      setItemName(''); // Clear item name field
      setItemCount(0); // Clear item count field
      setImage(null); // Clear image field
      setOpen(false); // Close the dialog box
    }
  };

  const removeItem = async (id) => {
    const itemDoc = doc(firestore, "inventory", id);
    await deleteDoc(itemDoc);
    updateInventory();
  };

  useEffect(() => {
    updateInventory();
  }, []);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleCaptureImage = () => {
    setCaptureImage(true);
  };

  const handleSaveImage = async (imageSrc) => {
    const storageRef = ref(storage, `images/${Date.now()}.jpg`);
    const response = await fetch(imageSrc);
    const blob = await response.blob();
    await uploadBytes(storageRef, blob);
    const downloadURL = await getDownloadURL(storageRef);
    setImage(downloadURL);
    setCaptureImage(false);
  };

  const webcamRef = useRef(null);

  const capture = useCallback(() => {
    const imageSrc = webcamRef.current.getScreenshot();
    handleSaveImage(imageSrc);
  }, [webcamRef]);

  const fetchRecipeSuggestion = async () => {
    try {
      const pantryItems = inventory.map(item => item.name);
  
      const response = await fetch('/api/suggest-recipes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ pantryItems }),
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch recipe suggestion');
      }
  
      const data = await response.json();
      setRecipe(data.recipe);
    } catch (error) {
      console.error('Error fetching recipe suggestion:', error);
      alert(`Error fetching recipe suggestion: ${error.message}`);
    }
  };

  const formatRecipe = (recipe) => {
    return recipe
      .split('\n')
      .filter(line => line.trim() !== '') // Filter out empty lines
      .map((line, index) => <Typography key={index} component="li">{line.replace(/[*#]/g, '')}</Typography>);
  };

  const filteredInventory = inventory.filter((item) =>
    item.name && item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Box sx={{ p: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <Typography variant="h2" color="#333" align="center" gutterBottom sx={{ width: '100%', bgcolor: '#ADD8E6', py: 2 }}>
        PantryChef
      </Typography>
      <Button variant="contained" onClick={handleClickOpen} sx={{ mb: 4 }}>
        Add New Item
      </Button>
      <TextField
        label="Search Items"
        value={searchQuery}
        onChange={handleSearchChange}
        fullWidth
        sx={{ mb: 4 }}
      />
      <Button variant="contained" onClick={fetchRecipeSuggestion} sx={{ mb: 4 }}>
        Suggest Recipe
      </Button>
      {recipe && (
        <Box sx={{ mt: 4 }}>
          <Typography variant="h5">Suggested Recipe:</Typography>
          <ul style={{ listStyleType: 'none', paddingLeft: 0 }}>{formatRecipe(recipe)}</ul>
        </Box>
      )}
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Add Item</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Item Name"
            value={itemName}
            onChange={(e) => setItemName(e.target.value)}
            fullWidth
          />
          <TextField
            margin="dense"
            label="Item Count"
            type="number"
            value={itemCount}
            onChange={(e) => setItemCount(Number(e.target.value))}
            fullWidth
          />
          <Button variant="contained" onClick={handleCaptureImage} sx={{ mt: 2 }}>
            Capture Image
          </Button>
          {image && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="h6">Captured Image:</Typography>
              <img src={image} alt="Captured" style={{ width: '100%', maxWidth: '200px' }} />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={addItem}>Add</Button>
        </DialogActions>
      </Dialog>
      {captureImage && (
        <Dialog open={captureImage} onClose={() => setCaptureImage(false)}>
          <DialogTitle>Capture Image</DialogTitle>
          <DialogContent>
            <Webcam
              audio={false}
              ref={webcamRef}
              screenshotFormat="image/jpeg"
              width="100%"
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setCaptureImage(false)}>Cancel</Button>
            <Button onClick={capture}>Capture</Button>
          </DialogActions>
        </Dialog>
      )}
      <Box sx={{ width: '100%', maxWidth: '800px', border: '1px solid #ccc', borderRadius: '8px' }}>
        <Stack spacing={2} sx={{ p: 2 }}>
          {filteredInventory.map(({ id, name, count, imageUrl, labels }) => (
            <Box
              key={id}
              display="flex"
              flexDirection="row"
              alignItems="center"
              justifyContent="space-between"
              bgcolor="#fff"
              padding={2}
              sx={{
                borderBottom: '1px solid #ccc',
              }}
            >
              <Box sx={{ flex: 1 }}>
                <Typography variant="h2" color="#333">
                  {name.charAt(0).toUpperCase() + name.slice(1)}
                </Typography>
                {labels && (
                  <Typography variant="body1" color="#666">
                    Labels: {labels}
                  </Typography>
                )}
              </Box>
              <Box sx={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
                <Typography variant="h5" color="#333">
                  {count}
                </Typography>
              </Box>
              <Box sx={{ flex: 1, display: 'flex', justifyContent: 'flex-end' }}>
                <Button variant="contained" color="primary" sx={{ bgcolor: '#cc0000', mr: 2 }} onClick={() => removeItem(id)}>
                  Remove
                </Button>
                {imageUrl && (
                  <Button variant="contained" color="primary" onClick={() => setViewImageUrl(imageUrl)}>
                    View Image
                  </Button>
                )}
              </Box>
            </Box>
          ))}
        </Stack>
      </Box>
      {viewImageUrl && (
        <Dialog open={Boolean(viewImageUrl)} onClose={() => setViewImageUrl('')}>
          <DialogTitle>Item Image</DialogTitle>
          <DialogContent>
            <img src={viewImageUrl} alt="Item" style={{ width: '100%', maxWidth: '400px' }} />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setViewImageUrl('')}>Close</Button>
          </DialogActions>
        </Dialog>
      )}
    </Box>
  );
}