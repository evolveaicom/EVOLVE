// Compress transaction using Zstandard
pub fn compress_transaction(
    instructions: Vec<Instruction>,
    signers: &[&dyn Signer]
) -> Result<Vec<u8>> {
    let message = Message::new_with_blockhash(
        &instructions,
        Some(&system_program::id()),
        &recent_blockhash
    );
    
    let mut tx = Transaction::new_unsigned(message);
    tx.try_sign(signers, recent_blockhash)?;
    
    let mut compressor = ZstdEncoder::new(Vec::new(), CompressionLevel::Default);
    compressor.write_all(&tx.serialize())?;
    Ok(compressor.finish()?)
} 